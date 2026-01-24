const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  session_token: {
    type: String,
    required: true,
    maxlength: 255
  },
  ip_address: {
    type: String,
    maxlength: 45
  },
  user_agent: {
    type: String
  },
  device_info: {
    type: String,
    maxlength: 255
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_accessed: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  }
});

// Indexes
userSessionSchema.index({ user_id: 1 });
userSessionSchema.index({ session_token: 1 });
userSessionSchema.index({ expires_at: 1 });

// Update last_accessed on save
userSessionSchema.pre('save', function(next) {
  this.last_accessed = Date.now();
  next();
});

module.exports = mongoose.model('UserSession', userSessionSchema);