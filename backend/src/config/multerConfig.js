const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Multer Configuration for PDF Uploads
 * - Stores PDFs in uploads/pdfs/
 * - Validates MIME type and extension
 * - Limits file size to 10MB
 */

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Disk Storage ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format: teacherId_uuid_originalname.pdf
    const uniqueName = `${req.user._id}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── File Filter: PDFs only ───────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

// ─── Multer Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

module.exports = upload;