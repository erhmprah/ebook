const Book = require("../../models/Book");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

  let image = null;
  if (imageFile) {
    try {
      const result = await cloudinary.uploader.upload(imageFile.path, { folder: 'book-images' });
      image = result.secure_url;
      await fs.unlink(imageFile.path);
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  }

  let book = null;
  if (bookFile) {
    try {
      const result = await cloudinary.uploader.upload(bookFile.path, { folder: 'book-files', resource_type: 'raw' });
      book = result.secure_url;
      await fs.unlink(bookFile.path);
    } catch (error) {
      console.error('Error uploading book to Cloudinary:', error);
      return res.status(500).json({ error: "Failed to upload book" });
    }
  }

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
