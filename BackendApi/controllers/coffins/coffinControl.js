const expressAsyncHandler = require("express-async-handler");
const { safeQuery, getConnection } = require("../../configurations/sqlConfig/db");
const NodeCache = require("node-cache");

// Cache Setup
const coffinCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Utility to generate RFID (placeholder logic)
const generateRFID = (name) => {
  return 'RFID-' + name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now();
};

// ✅ Create Coffin (uses `users` instead of `staff`)
const createCoffin = expressAsyncHandler(async (req, res) => {
  try {
    console.log('=== COFFIN CREATION REQUEST ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { 
      coffin_id, 
      type,      
      material,
      exact_price,
      quantity,
      supplier,
      color,
      size,
      created_by // Can be username or name
    } = req.body;

    if (!type || !material || !exact_price) {
      return res.status(400).json({ 
        error: "Missing required fields: type, material, and exact_price are required." 
      });
    }

    let image_url = null;
    if (req.file) {
      image_url = `/uploads/coffins/${req.file.filename}`;
      console.log('✅ Image uploaded to:', image_url);
    }

    // 🔍 Look up user ID using username or name
 let userId = null;
if (created_by) {
  const createdByTrimmed = created_by.trim();
  const users = await safeQuery(
    "SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?) LIMIT 1",
    [createdByTrimmed, createdByTrimmed]
  );
  console.log("User lookup results:", users);
  const user = users[0];
  if (!user) {
    return res.status(400).json({ success: false, error: "Invalid username or name in created_by" });
  }
  userId = user.id;
} else if (req.user && req.user.id) {
  userId = req.user.id;
} else {
  userId = 1; // fallback default user ID
}

   const insertSql = `
  INSERT INTO coffins 
  (custom_id, type, material, exact_price, quantity, supplier, color, size, image_url, created_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;


    const result = await safeQuery(insertSql, [
      coffin_id || null,
      type,
      material,
      parseFloat(exact_price) || 0,
      parseInt(quantity) || 1,
      supplier || null,
      color || null,
      size || null,
      image_url,
      userId
    ]);

    coffinCache.del("allCoffins"); // Clear cache

    res.status(201).json({
      success: true,
      message: "✅ Coffin created successfully",
      coffin_id: result.insertId,
      image_path: image_url,
      data: {
        coffin_id: coffin_id || result.insertId,
        type,
        material,
        exact_price,
        quantity: quantity || 1,
        created_by: userId
      }
    });

  } catch (err) {
    console.error("❌ DATABASE ERROR inserting coffin:", err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: "Custom ID already exists. Use a different ID." });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ success: false, error: "Invalid user reference. Please check the creator." });
    }

    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
});

// ✅ Get All Coffins (with cache)
const getAllCoffins = expressAsyncHandler(async (req, res) => {
  try {
    let coffins = coffinCache.get("allCoffins");

    if (!coffins) {
      const sql = `
        SELECT 
          coffin_id, type, material, exact_price, quantity, supplier, 
          origin, image_url, created_at, updated_at, buying_price,
          COALESCE(color, 'Not specified') as color,
          COALESCE(size, 'Standard') as size
        FROM coffins 
        ORDER BY created_at DESC
      `;
      coffins = await safeQuery(sql);
      coffinCache.set("allCoffins", coffins);
    }

    res.status(200).json({
      success: true,
      data: coffins || [],
      count: coffins.length,
      message: coffins.length === 0 ? "No coffins found" : "Coffins fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching coffins:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch coffins" 
    });
  }
});

// ✅ Assign Coffin (uses `users` instead of `staff`)
const assignCoffin = expressAsyncHandler(async (req, res) => {
  const { deceased_id, coffin_id, assigned_by, assigned_date, deceased_name } = req.body;

  if (!deceased_id || !coffin_id || !assigned_by || !deceased_name) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: deceased_id, coffin_id, assigned_by, and deceased_name are required." 
    });
  }

  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    // Lock coffin row
    const [coffin] = await safeQuery(
      'SELECT quantity, type, material FROM coffins WHERE coffin_id = ? FOR UPDATE',
      [coffin_id]
    );

    if (!coffin) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Coffin not found" });
    }

    if (coffin.quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Coffin out of stock" });
    }

    // Lookup user ID from `users` table using `work_id`
    const [user] = await safeQuery(
      `SELECT id FROM users WHERE work_id = ?`, 
      [assigned_by]
    );
    
    if (!user) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "User not found (assigned_by)" });
    }

    const finalAssignedDate = assigned_date && !isNaN(Date.parse(assigned_date)) 
      ? assigned_date 
      : new Date().toISOString().split("T")[0];

    const rfid = generateRFID(deceased_name);

    // Insert assignment
    const insertSql = `
      INSERT INTO deceased_coffin (deceased_id, coffin_id, assigned_by, assigned_date, rfid)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await safeQuery(insertSql, [
      deceased_id, coffin_id, user.id, finalAssignedDate, rfid
    ]);

    // Update coffin stock
    await safeQuery(
      'UPDATE coffins SET quantity = quantity - 1, updated_at = NOW() WHERE coffin_id = ?',
      [coffin_id]
    );

    await connection.commit();
    coffinCache.del("allCoffins");

    res.status(201).json({
      success: true,
      message: "✅ Coffin assigned successfully",
      assignment_id: result.insertId,
      rfid,
      coffin_details: {
        type: coffin.type,
        material: coffin.material
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Error assigning coffin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database error during assignment",
      error: error.message 
    });
  }
});

module.exports = {
  createCoffin,
  getAllCoffins,
  assignCoffin,
};
