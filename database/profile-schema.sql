-- Profile Management Database Schema
-- BookHub User Profiles, Settings, and Images

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio TEXT,
    phone VARCHAR(50),
    location VARCHAR(255),
    avatar_url VARCHAR(500),
    account_type ENUM('google', 'email', 'admin') DEFAULT 'email',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    marketing_communications BOOLEAN DEFAULT FALSE,
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    reading_activity BOOLEAN DEFAULT TRUE,
    theme VARCHAR(50) DEFAULT 'gradient',
    font_size ENUM('small', 'medium', 'large', 'extra-large') DEFAULT 'medium',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    session_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Create user_activity_log table for tracking user activity
CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    activity_type ENUM('login', 'logout', 'profile_update', 'settings_change', 'avatar_upload', 'book_view', 'category_view') NOT NULL,
    activity_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Insert sample data for testing
INSERT IGNORE INTO user_profiles (user_id, full_name, email, account_type) 
VALUES ('sample_user_1', 'John Doe', 'john.doe@example.com', 'email');

INSERT IGNORE INTO user_settings (user_id) 
VALUES ('sample_user_1');