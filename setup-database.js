const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Setup the database schema for BookHub Profile Management
 * Run this script after installing dependencies to initialize the database
 */
async function setupProfileDatabase() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ebook',
      multipleStatements: true
    });

    console.log('📊 Setting up BookHub Database...');

    // Read and execute the profile schema file
    const profileSchemaPath = path.join(__dirname, 'database', 'profile-schema.sql');
    const profileSchema = fs.readFileSync(profileSchemaPath, 'utf8');
    
    await connection.query(profileSchema);
    
    // Read and execute the books schema file
    const booksSchemaPath = path.join(__dirname, 'database', 'books-schema.sql');
    const booksSchema = fs.readFileSync(booksSchemaPath, 'utf8');
    
    await connection.query(booksSchema);
    
    console.log('✅ Database schema created successfully!');
    console.log('📋 Tables created:');
    console.log('   - user_profiles');
    console.log('   - user_settings');
    console.log('   - user_sessions');
    console.log('   - user_activity_log');
    console.log('   - books');
    console.log('');
    console.log('🎯 Profile management backend is now ready!');
    console.log('');
    console.log('📚 Available API endpoints:');
    console.log('   GET    /api/profile              - Get user profile');
    console.log('   PUT    /api/profile              - Update user profile');
    console.log('   PUT    /api/profile/settings     - Update user settings');
    console.log('   GET    /api/profile/activity      - Get activity log');
    console.log('   GET    /api/profile/avatar        - Get current avatar');
    console.log('   POST   /api/profile/avatar        - Upload new avatar');
    console.log('   DELETE /api/profile/avatar        - Delete avatar');
    console.log('   GET    /api/profile/sessions      - Get active sessions');
    console.log('   DELETE /api/profile/sessions/:id  - Terminate session');
    console.log('   DELETE /api/profile/sessions      - Terminate all other sessions');
    console.log('   DELETE /api/profile/account       - Delete user account');
    console.log('');
    console.log('🔧 Make sure to install required dependencies:');
    console.log('   npm install sharp multer');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check your database credentials in .env file');
    console.error('   2. Ensure MySQL is running and accessible');
    console.error('   3. Verify you have permissions to create databases/tables');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
if (require.main === module) {
  setupProfileDatabase()
    .then(() => {
      console.log('🚀 Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProfileDatabase };