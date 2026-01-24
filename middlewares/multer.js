const multer = require("multer");
const path = require("path");

// Set storage engine for multer (using memory storage for serverless compatibility)
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
  // Allowed MIME types
  const allowedMimes = /image\/(jpeg|jpg|png|gif)|application\/pdf/;
  // Check the MIME type
  const mimetype = allowedMimes.test(file.mimetype);

  // Also check file extension for additional security
  const allowedExts = /\.(jpeg|jpg|png|pdf|gif)$/i;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only JPEG, PNG, GIF images and PDF files are allowed!");
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
