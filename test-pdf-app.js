const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Test route to check if a PDF file exists
app.get('/test-pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log('Testing PDF file:', filePath);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      filename: filename,
      size: stats.size,
      modified: stats.mtime
    });
  } else {
    res.json({
      exists: false,
      filename: filename,
      message: 'File not found in uploads directory'
    });
  }
});

// List all PDF files in uploads directory
app.get('/list-pdfs', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    res.json({
      totalFiles: files.length,
      pdfFiles: pdfFiles,
      pdfCount: pdfFiles.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error reading uploads directory',
      message: error.message
    });
  }
});

// Test PDF serving route
app.use('/pdf', require('./routes/pdf'));

module.exports = app;