const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  activity_type: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'profile_update', 'settings_change', 'avatar_upload', 'book_view', 'category_view']
  },
  activity_description: {
    type: String
  },
  ip_address: {
    type: String,
    maxlength: 45
  },
  user_agent: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userActivityLogSchema.index({ user_id: 1 });
userActivityLogSchema.index({ activity_type: 1 });
userActivityLogSchema.index({ created_at: 1 });

module.exports = mongoose.model('UserActivityLog', userActivityLogSchema);