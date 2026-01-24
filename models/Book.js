const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 500
  },
  author: {
    type: String,
    required: true,
    maxlength: 255
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true,
    maxlength: 255
  },
  excerpt: {
    type: String
  },
  class: {
    type: String,
    maxlength: 100
  },
  image: {
    type: String,
    maxlength: 500
  },
  book: {
    type: String,
    maxlength: 500
  },
  price: {
    type: Number,
    default: 0.00,
    min: 0
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Indexes
bookSchema.index({ category: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ title: 1 });

module.exports = mongoose.model('Book', bookSchema);