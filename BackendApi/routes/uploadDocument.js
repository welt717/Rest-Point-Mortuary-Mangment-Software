const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");  // UUID
const { safeQuery } = require("../configurations/sqlConfig/db");
const { getKenyaTimeISO } = require("../utilities/timeStamps/timeStamps");

// Helper: convert absolute path to relative URL
const normalizePath = (filePath) => {
  return filePath
    ? filePath.replace(/^.*[\\/]uploads[\\/]documents[\\/]/, '/uploads/documents/')
    : null;
};

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/zip",
    "application/x-rar-compressed",
  ];
  cb(null, allowedTypes.includes(file.mimetype));
};

// Determine document type from extension/MIME
function getDocumentType(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext === ".pdf" || mime === "application/pdf") return "PDF Document";
  if ([".doc", ".docx"].includes(ext)) return "Word Document";
  if ([".xls", ".xlsx"].includes(ext)) return "Excel Spreadsheet";
  if (ext === ".txt") return "Text File";
  if (ext === ".csv") return "CSV File";
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return "Image";
  if ([".zip", ".rar"].includes(ext)) return "Archive";

  return "Unknown Document";
}

// Retry-safe folder creation
function ensureFolderExists(dir, retries = 3, delay = 100) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        resolve();
      } catch (err) {
        if (retries > 0) {
          retries--;
          setTimeout(attempt, delay);
        } else {
          reject(err);
        }
      }
    };
    attempt();
  });
}

// Multer storage (dynamic folder + UUID)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const deceasedId = req.params.deceasedId;
      const deceasedFolder = path.join(__dirname, `../uploads/documents/${deceasedId}`);
      await ensureFolderExists(deceasedFolder);
      cb(null, deceasedFolder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const newName = uuidv4() + path.extname(file.originalname).toLowerCase();
    cb(null, newName);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Route: multiple uploads
router.post("/deceased/:deceasedId/documents", upload.array("files", 10), async (req, res) => {
  try {
    const { deceasedId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadedAt = getKenyaTimeISO();
    const uploadedFiles = [];

    for (const file of files) {
      const docType = getDocumentType(file);
      const relativePath = normalizePath(file.path);

      await safeQuery(
        `INSERT INTO documents 
          (deceased_id, document_type, file_name, file_path, mime_type, uploaded_at, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [deceasedId, docType, file.originalname, relativePath, file.mimetype, uploadedAt, uploadedAt]
      );

      uploadedFiles.push({
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        detectedType: docType,
        sizeKB: Math.round(file.size / 1024),
        url: relativePath,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      deceasedId,
      uploadedAt,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

module.exports = router;
