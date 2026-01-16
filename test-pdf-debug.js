const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const conn = require('./connection');

const app = express();
app.use(cors());
app.use(express.json());

// Test route to check database and PDF functionality
app.get('/debug/pdf/:bookId', async (req, res) => {
  const bookId = req.params.bookId;
  
  try {
    // Fetch book from database
    const query = "SELECT idbooks, title, book FROM books WHERE idbooks = ?";
    
    const books = await new Promise((resolve, reject) => {
      conn.query(query, [bookId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (!books || books.length === 0) {
      return res.json({
        error: 'Book not found',
        bookId: bookId
      });
    }
    
    const book = books[0];
    const bookPath = book.book;
    
    // Check if file exists
    const fullPath = path.join(__dirname, bookPath);
    const fileExists = fs.existsSync(fullPath);
    
    // Test PDF serving
    let pdfAccessible = false;
    if (fileExists) {
      try {
        const testResponse = await fetch(`http://localhost:4000/pdf/${path.basename(bookPath)}`);
        pdfAccessible = testResponse.ok;
      } catch (error) {
        console.log('PDF serving test failed:', error.message);
      }
    }
    
    res.json({
      book: {
        id: book.idbooks,
        title: book.title,
        storedPath: bookPath,
        fileExists: fileExists,
        fullPath: fullPath
      },
      pdfServing: {
        accessible: pdfAccessible,
        testUrl: `/pdf/${path.basename(bookPath)}`
      },
      sessionStorageTest: {
        expectedKey: 'book',
        expectedValue: bookPath,
        processedUrl: `/pdf/${path.basename(bookPath)}`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  }
});

// List all books with their PDF status
app.get('/debug/books', async (req, res) => {
  try {
    const query = "SELECT idbooks, title, book, price, status FROM books LIMIT 10";
    
    const books = await new Promise((resolve, reject) => {
      conn.query(query, [], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    const booksWithStatus = books.map(book => {
      const bookPath = book.book;
      const fullPath = path.join(__dirname, bookPath);
      const fileExists = fs.existsSync(fullPath);
      
      return {
        id: book.idbooks,
        title: book.title,
        storedPath: bookPath,
        fileExists: fileExists,
        fullPath: fullPath,
        price: book.price,
        status: book.status,
        pdfUrl: `/pdf/${path.basename(bookPath)}`
      };
    });
    
    res.json({
      totalBooks: books.length,
      books: booksWithStatus
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Test URLs:`);
  console.log(`  - List all books: http://localhost:${PORT}/debug/books`);
  console.log(`  - Test specific book: http://localhost:${PORT}/debug/pdf/1`);
});