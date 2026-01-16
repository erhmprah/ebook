const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCategories() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Ones1mus@19',
      database: process.env.DB_NAME || 'ebook'
    });

    console.log('🔍 Checking available book categories...\n');

    // Check distinct categories
    const [categories] = await connection.query('SELECT DISTINCT category, COUNT(*) as count FROM books GROUP BY category ORDER BY count DESC');
    
    console.log('📚 Available categories:');
    categories.forEach(cat => {
      console.log(`   - "${cat.category}": ${cat.count} books`);
    });

    console.log('\n📖 Sample books by category:');
    
    // Get sample books from each category
    for (const cat of categories) {
      const [books] = await connection.query('SELECT title, Author, category FROM books WHERE category = ? LIMIT 2', [cat.category]);
      console.log(`\n   ${cat.category}:`);
      books.forEach(book => {
        console.log(`     - "${book.title}" by ${book.Author}`);
      });
    }

  } catch (error) {
    console.error('❌ Category check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkCategories();