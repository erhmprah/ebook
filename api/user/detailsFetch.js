const Book = require("../backend/models/Book");
const mongoose = require('mongoose');

async function detailsFetch(req, res) {
  const bookId = req.query.id;

  if (!bookId || bookId === 'undefined' || !mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(bookId).select('_id title author description excerpt price image book');
    res.json(book ? [book] : []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = detailsFetch;
