const Book = require("../../models/Book");
const path = require("path");

async function insertBookApi(req, res) {
  const title = req.body.title;
  const author = req.body.author;
  const description = req.body.description;
  const category = req.body.category;
  const excerpt = req.body.excerpt;
  const _class = req.body.class;
  const price = req.body.price;
  const date = req.body.date;
  const imageFile = req.files["image"] ? req.files["image"][0] : null; // First image file
  const bookFile = req.files["book"] ? req.files["book"][0] : null; // First book file

  // Get the file paths or set default values
  const image = imageFile ? path.join("uploads", imageFile.filename) : null;
  const book = bookFile ? path.join("uploads", bookFile.filename) : null;

  try {
    const newBook = new Book({
      title,
      author,
      description,
      category,
      excerpt,
      class: _class,
      price: parseFloat(price) || 0,
      image,
      book,
      dateAdded: date ? new Date(date) : new Date()
    });

    const savedBook = await newBook.save();
    res.send(`Book inserted successfully with an id of ${savedBook._id}`);
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: "Failed to insert book" });
  }
}

module.exports = insertBookApi;
