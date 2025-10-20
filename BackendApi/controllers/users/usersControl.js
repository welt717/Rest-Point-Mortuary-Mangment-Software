const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { pool } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
const RESET_TOKEN = "400453@welttallis";

const failedLogins = {};
const MAX_FAILED = 10;
const BLOCK_TIME = 15 * 60 * 1000;

// 🔧 DB helper
async function safeExecute(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (err) {
    console.error('❌ MariaDB Error:', err);
    throw err;
  }
}

// 🔒 IP Block check
function isIpBlocked(ip) {
  const record = failedLogins[ip];
  if (!record) return false;

  if (record.count >= MAX_FAILED) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < BLOCK_TIME) return true;
    delete failedLogins[ip];
  }
  return false;
}

// ✅ Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, role, password, branch_id } = req.body;

  if (!name || !username || !role || !password || !branch_id) {
    return res.status(400).json({ success: false, message: "All fields including branch_id are required." });
  }

  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({ success: false, message: "Invalid username." });
  }

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address." });
  }

  const validRoles = ['admin', 'mortuary-staff', 'pathologist', 'dispatch', 'receptionist'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role provided.' });
  }

  const [branchExists] = await safeExecute("SELECT * FROM branches WHERE id = ?", [branch_id]);
  if (!branchExists) {
    return res.status(400).json({ success: false, message: "Invalid branch_id." });
  }

  const existing = await safeExecute(
    "SELECT 1 FROM users WHERE username = ? OR email = ?",
    [username, email]
  );

  if (existing.length > 0) {
    return res.status(400).json({ success: false, message: "Username or email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdAt = getKenyaTimeISO();

  const result = await safeExecute(
    `INSERT INTO users (name, username, email, role, password_hash, branch_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, username, email || null, role, hashedPassword, branch_id, createdAt, createdAt]
  );

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: {
      id: result.insertId,
      name,
      username,
      email,
      role,
      branch_id,
      branch_name: branchExists.name
    }
  });
});

// ✅ Login User
const loginUser = asyncHandler(async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (isIpBlocked(ip)) {
    return res.status(429).json({ success: false, message: "Too many failed attempts. Try again later." });
  }

  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Username/email and password required." });
  }

  let user;
  if (validator.isEmail(identifier)) {
    user = await safeExecute("SELECT * FROM users WHERE email = ?", [identifier]);
  } else {
    user = await safeExecute("SELECT * FROM users WHERE username = ?", [identifier]);
  }

  if (!user || user.length === 0) {
    failedLogins[ip] = {
      count: (failedLogins[ip]?.count || 0) + 1,
      lastAttempt: Date.now()
    };
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  const validPass = await bcrypt.compare(password, user[0].password_hash);
  if (!validPass) {
    failedLogins[ip] = {
      count: (failedLogins[ip]?.count || 0) + 1,
      lastAttempt: Date.now()
    };
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  if (failedLogins[ip]) delete failedLogins[ip];

  const now = getKenyaTimeISO();
  await safeExecute(
    "INSERT INTO attendance_logs (user_id, action, timestamp) VALUES (?, 'login', ?)",
    [user[0].id, now]
  );

  const token = jwt.sign(
    { id: user[0].id, role: user[0].role, branch_id: user[0].branch_id },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000
  });

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    user: {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role,
      branch_id: user[0].branch_id,
      checkin_time: now
    }
  });
});

// ✅ Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: "User not authenticated." });
  }

  const user = await safeExecute("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user || user.length === 0) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const now = getKenyaTimeISO();
  await safeExecute(
    "INSERT INTO attendance_logs (user_id, action, timestamp) VALUES (?, 'logout', ?)",
    [userId, now]
  );

  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });

  res.json({
    success: true,
    message: "Logout successful.",
    checkout_time: now
  });
});

// ✅ Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { username, newPassword, resetKey } = req.body;

  if (!username || !newPassword || !resetKey) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (resetKey !== RESET_TOKEN) {
    return res.status(403).json({ success: false, message: "Invalid reset key." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await safeExecute(
    "UPDATE users SET password_hash = ?, updated_at = ? WHERE username = ?",
    [hashedPassword, getKenyaTimeISO(), username]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.json({ success: true, message: "Password reset successful." });
});

// ✅ Fetch all users (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await safeExecute(
    `SELECT u.id, u.name, u.username, u.email, u.role, u.branch_id, b.name AS branch_name, u.created_at, u.updated_at 
     FROM users u 
     LEFT JOIN branches b ON u.branch_id = b.id 
     ORDER BY u.created_at DESC`
  );
  res.json({ success: true, count: users.length, users });
});



// ✅ Fetch attendance logs
const getAttendanceLogs = asyncHandler(async (req, res) => {
  const logs = await safeExecute(
    `SELECT a.id, u.username, u.role, a.action, a.timestamp
     FROM attendance_logs a
     JOIN users u ON a.user_id = u.id
     ORDER BY a.timestamp DESC`
  );
  res.json({ success: true, count: logs.length, logs });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getAllUsers,
  getAttendanceLogs
};
