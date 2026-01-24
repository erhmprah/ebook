const Book = require("../../models/Book");

async function categoryFetch(req, res) {
  const category = req.query.category;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const showAll = req.query.showAll === 'true';

  try {
    // Handle '%' as wildcard to match all categories
    const query = category === '%' ? {} : { category: { $regex: category, $options: 'i' } };

    let books;
    let total;

    if (showAll) {
      // Fetch all books without pagination
      books = await Book.find(query).select('_id title author description category excerpt class image book price dateAdded');
      total = books.length;
    } else {
      // Fetch with pagination
      books = await Book.find(query)
        .select('_id title author description category excerpt class image book price dateAdded')
        .skip(offset)
        .limit(limit);
      total = await Book.countDocuments(query);
    }

    res.json({
      books: books,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = categoryFetch;
