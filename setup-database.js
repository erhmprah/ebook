const mongoose = require('./connection');
const Book = require('./models/Book');
const UserProfile = require('./models/UserProfile');
const UserSettings = require('./models/UserSettings');

/**
 * Setup the MongoDB collections for BookHub
 * Run this script after installing dependencies to seed the database
 */
async function setupMongoDatabase() {
  try {
    console.log('📊 Setting up BookHub MongoDB Database...');

    // Seed sample user profile
    const sampleUserId = 'sample_user_1';
    const existingProfile = await UserProfile.findOne({ user_id: sampleUserId });
    if (!existingProfile) {
      await UserProfile.create({
        user_id: sampleUserId,
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        account_type: 'email'
      });

      await UserSettings.create({
        user_id: sampleUserId
      });

      console.log('✅ Sample user profile created!');
    } else {
      console.log('ℹ️ Sample user profile already exists, skipping seed.');
    }

    console.log('✅ MongoDB setup completed successfully!');
    console.log('📋 Collections ready:');
    console.log('   - books');
    console.log('   - userprofiles');
    console.log('   - usersettings');
    console.log('   - usersessions');
    console.log('   - useractivitylogs');
    console.log('');
    console.log('🎯 BookHub backend is now ready!');
    console.log('');
    console.log('📚 Available API endpoints:');
    console.log('   GET    /api/books/category/:category    - Get books by category');
    console.log('   GET    /api/books/:id                   - Get book details');
    console.log('   POST   /api/admin/books                 - Add new book');
    console.log('   GET    /api/profile                     - Get user profile');
    console.log('   PUT    /api/profile                     - Update user profile');
    console.log('   PUT    /api/profile/settings            - Update user settings');
    console.log('');
    console.log('🔧 Make sure to install required dependencies:');
    console.log('   npm install sharp multer');

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check your MongoDB connection string');
    console.error('   2. Ensure MongoDB is running and accessible');
    console.error('   3. Verify your network connectivity');
    console.error('');
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupMongoDatabase()
    .then(() => {
      console.log('🚀 MongoDB setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupMongoDatabase };