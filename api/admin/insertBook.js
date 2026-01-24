const Book = require("../../models/Book");
const path = require("path");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function insertBookApi(req, res) {
  console.log('InsertBook API called with body:', req.body);
  console.log('Files received:', req.files ? Object.keys(req.files) : 'none');

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

  console.log('Image file:', imageFile ? `${imageFile.originalname} (${imageFile.size} bytes)` : 'none');
  console.log('Book file:', bookFile ? `${bookFile.originalname} (${bookFile.size} bytes)` : 'none');

  let image = null;
  let book = null;

  // Upload files sequentially to avoid timeout
  try {
    if (imageFile) {
      console.log('Starting image upload to Cloudinary...');
      const imageResult = await cloudinary.uploader.upload(imageFile.buffer, { folder: 'book-images', timeout: 60000 });
      image = imageResult.secure_url;
      console.log('Image uploaded successfully:', image);
    }

    if (bookFile) {
      console.log('Starting book upload to Cloudinary...');
      const bookResult = await cloudinary.uploader.upload(bookFile.buffer, { folder: 'book-files', resource_type: 'raw', timeout: 120000 });
      book = bookResult.secure_url;
      console.log('Book uploaded successfully:', book);
    }

    console.log('All uploads completed successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }

  try {
    console.log('Creating new book object...');
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

    console.log('Saving book to database...');
    const savedBook = await newBook.save();
    console.log('Book saved successfully with ID:', savedBook._id);
    res.send(`Book inserted successfully with an id of ${savedBook._id}`);
  } catch (error) {
    console.error('Database save error:', error.stack);
    res.status(500).json({ error: "Failed to insert book" });
  }
}

module.exports = insertBookApi;
