const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateCategories() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Ones1mus@19',
      database: process.env.DB_NAME || 'ebook'
    });

    console.log('🔄 Updating book categories to match frontend expectations...\n');

    // Update categories to match frontend expectations
    const updates = [
      { from: 'Textbook', to: 'Textbooks' },
      { from: 'Text book', to: 'Textbooks' },
      { from: 'novels', to: 'Storybooks' },
      { from: 'Stories', to: 'Storybooks' },
      { from: 'Novel', to: 'Storybooks' },
    ];

    for (const update of updates) {
      const [result] = await connection.query(
        'UPDATE books SET category = ? WHERE category = ?',
        [update.to, update.from]
      );
      console.log(`✅ Updated ${result.affectedRows} books from "${update.from}" to "${update.to}"`);
    }

    // Add some poetry and non-fiction books for testing
    const additions = [
      {
        title: 'Poems of Nature',
        Author: 'Nature Poet',
        Discription: 'Beautiful poetry collection',
        category: 'Poetry Books',
        excerpt: 'Poems that celebrate nature',
        class: 'All Ages',
        image: 'images/download.png',
        book: 'uploads/sample-poetry.pdf',
        price: 12
      },
      {
        title: 'How Things Work',
        Author: 'Science Author',
        Discription: 'Educational book about science',
        category: 'Informational / Non-Fiction Books',
        excerpt: 'Learn how things work',
        class: 'All Ages',
        image: 'images/download.png',
        book: 'uploads/sample-science.pdf',
        price: 15
      }
    ];

    for (const book of additions) {
      await connection.query(
        'INSERT INTO books (title, Author, Discription, category, excerpt, class, image, book, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [book.title, book.Author, book.Discription, book.category, book.excerpt, book.class, book.image, book.book, book.price]
      );
      console.log(`✅ Added new book: "${book.title}" in category "${book.category}"`);
    }

    console.log('\n📊 Final category count:');
    const [categories] = await connection.query('SELECT category, COUNT(*) as count FROM books GROUP BY category ORDER BY count DESC');
    categories.forEach(cat => {
      console.log(`   - "${cat.category}": ${cat.count} books`);
    });

  } catch (error) {
    console.error('❌ Category update failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateCategories();