const mongoose = require('./connection');
const Book = require('./models/Book');
const fs = require('fs');
const path = require('path');

/**
 * Import books from app/data/books.json to MongoDB
 */
async function importBooks() {
  try {
    console.log('📚 Importing books from app/data/books.json to MongoDB...');

    // Read the books.json file
    const booksPath = path.join(__dirname, '../app/data/books.json');
    const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

    if (!booksData.books || !Array.isArray(booksData.books)) {
      throw new Error('Invalid books.json format');
    }

    console.log(`Found ${booksData.books.length} books to import`);

    // Transform the data to match MongoDB schema (lowercase field names)
    const transformedBooks = booksData.books.map(book => ({
      title: book.Title,
      author: book.Author,
      description: book.Discription,
      category: book.Category,
      excerpt: book.Excerpt,
      class: book.Class,
      image: book.Image,
      book: book.Book,
      dateAdded: book.dateAdded ? new Date(book.dateAdded) : new Date()
    }));

    // Clear existing books
    await Book.deleteMany({});
    console.log('🗑️ Cleared existing books from database');

    // Insert new books
    const insertedBooks = await Book.insertMany(transformedBooks);
    console.log(`✅ Successfully imported ${insertedBooks.length} books`);

    // Show category summary
    const categories = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Books imported by category:');
    categories.forEach(cat => {
      console.log(`   - ${cat._id}: ${cat.count} books`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

// Run the import
if (require.main === module) {
  importBooks();
}

module.exports = { importBooks };