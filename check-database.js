const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Ones1mus@19',
      database: process.env.DB_NAME || 'ebook'
    });

    console.log('🔍 Checking database structure...\n');

    // Check if books table exists
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Existing tables:', tables.map(t => Object.values(t)[0]));

    // Check books table structure
    try {
      const [columns] = await connection.query('DESCRIBE books');
      console.log('\n📚 Books table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('\n❌ Books table does not exist');
    }

    // Check existing books data
    try {
      const [books] = await connection.query('SELECT * FROM books LIMIT 5');
      console.log('\n📖 Sample books data:');
      if (books.length > 0) {
        console.log(JSON.stringify(books[0], null, 2));
      } else {
        console.log('   No books found');
      }
    } catch (error) {
      console.log('\n❌ Cannot query books table');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();