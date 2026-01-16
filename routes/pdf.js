const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Serve PDF files with proper headers and security
router.get("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Basic validation - only allow PDF files
    if (!filename.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Clean filename to prevent directory traversal
    const cleanFilename = path.basename(filename);
    const filePath = path.join(__dirname, "../uploads", cleanFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers for PDF display
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin access for Edge new windows
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Security header
    
    // Restore secure headers - Edge users will use new window approach
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Secure iframe policy for other browsers
    
    // Remove server information for security
    res.removeHeader('X-Powered-By');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('PDF serving error:', error);
    res.status(500).json({ error: 'Error serving PDF' });
  }
});

module.exports = router;