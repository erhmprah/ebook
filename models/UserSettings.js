const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  email_notifications: {
    type: Boolean,
    default: true
  },
  push_notifications: {
    type: Boolean,
    default: false
  },
  marketing_communications: {
    type: Boolean,
    default: false
  },
  profile_visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  reading_activity: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    maxlength: 50,
    default: 'gradient'
  },
  font_size: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra-large'],
    default: 'medium'
  },
  two_factor_enabled: {
    type: Boolean,
    default: false
  },
  session_count: {
    type: Number,
    default: 0
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
userSettingsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);