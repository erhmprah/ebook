const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  full_name: {
    type: String,
    required: true,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    maxlength: 255
  },
  bio: {
    type: String
  },
  phone: {
    type: String,
    maxlength: 50
  },
  location: {
    type: String,
    maxlength: 255
  },
  avatar_url: {
    type: String,
    maxlength: 500
  },
  account_type: {
    type: String,
    enum: ['google', 'email', 'admin'],
    default: 'email'
  },
  last_login: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes are defined in the schema fields with index: true

// Update updated_at on save
userProfileSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);