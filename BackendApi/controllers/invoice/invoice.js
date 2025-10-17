// controllers/invoiceController.js
const { safeQuery, safeQueryOne } = require('../../configurations/sqlConfig/db');
const escpos = require('escpos');
escpos.Network = require('escpos-network'); // future use for network printers

/**
 * 🧾 Get invoice details for a deceased record (simulated print)
 */
const getInvoice = async (req, res) => {
  try {
    const { deceasedId } = req.params;

    // 1️⃣ Fetch deceased safely
    const deceased = await safeQueryOne(
      "SELECT * FROM deceased WHERE deceased_id = ?",
      [deceasedId]
    );

    if (!deceased) {
      return res.status(404).json({ message: "Deceased not found" });
    }

    // 2️⃣ Fetch extra charges (e.g. embalming, transport)
    const charges = await safeQuery(
      "SELECT * FROM extra_charges WHERE deceased_id = ?",
      [deceasedId]
    );

    // 3️⃣ Fetch payments
    const payments = await safeQuery(
      "SELECT * FROM payments WHERE deceased_id = ?",
      [deceased.id] // payments table uses the internal numeric ID
    );

    // 4️⃣ Compute totals
    const subtotal = charges.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const balance = subtotal - totalPaid;

    // 5️⃣ Build simulated invoice printout text
    const invoiceText = `
==============================
   MONALISA FUNERAL HOME
==============================
Invoice ID: INV-${new Date().getFullYear()}-${deceasedId}
Date: ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}
------------------------------
Name: ${deceased.full_name}
Gender: ${deceased.gender}
Cause of Death: ${deceased.cause_of_death || "N/A"}
------------------------------
Charges:
${charges.map(c => `${c.description || "Item"} - KSh ${c.amount}`).join("\n") || "None"}
------------------------------
Subtotal: KSh ${subtotal.toFixed(2)}
Paid:     KSh ${totalPaid.toFixed(2)}
Balance:  KSh ${balance.toFixed(2)}
------------------------------
Thank you for choosing Monalisa Funeral Home
==============================
`;

    // 🖨️ Simulated print response (no real printer yet)
    return res.json({
      message: `Invoice generated for ${deceased.full_name}`,
      invoiceId: `INV-${new Date().getFullYear()}-${deceasedId}`,
      preview: {
        deceasedName: deceased.full_name,
        subtotal,
        totalPaid,
        balance,
        currency: "KES",
        date: new Date(),
      },
      simulated_print: invoiceText.trim(),
    });

    // ⚙️ When printer arrives:
    // const device = new escpos.Network('192.168.1.120', 9100);
    // const printer = new escpos.Printer(device);
    // device.open(() => {
    //   printer.text(invoiceText);
    //   printer.cut();
    //   printer.close();
    // });

  } catch (error) {
    console.error("❌ Error fetching invoice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getInvoice };
