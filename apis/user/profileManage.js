const conn = require("../../connection");
const crypto = require('crypto');

/**
 * Get user profile information
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }

    const profileQuery = `
      SELECT 
        user_id, full_name, email, bio, phone, location, 
        avatar_url, account_type, last_login, created_at, updated_at
      FROM user_profiles 
      WHERE user_id = ? LIMIT 1
    `;

    const settingsQuery = `
      SELECT 
        email_notifications, push_notifications, marketing_communications,
        profile_visibility, reading_activity, theme, font_size, 
        two_factor_enabled, session_count
      FROM user_settings 
      WHERE user_id = ? LIMIT 1
    `;

    const profileData = await executeQuery(profileQuery, [userId]);
    const settingsData = await executeQuery(settingsQuery, [userId]);

    if (profileData.length === 0) {
      // Create profile if it doesn't exist
      const newProfile = await createProfileFromGoogle(req.user);
      return res.json({
        success: true,
        data: {
          profile: newProfile,
          settings: getDefaultSettings()
        }
      });
    }

    res.json({
      success: true,
      data: {
        profile: profileData[0],
        settings: settingsData[0] || getDefaultSettings()
      }
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Update user profile information
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }

    const { full_name, bio, phone, location } = req.body;

    // Validate input
    if (!full_name || full_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Full name is required"
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 500 characters"
      });
    }

    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format"
      });
    }

    const updateQuery = `
      UPDATE user_profiles 
      SET full_name = ?, bio = ?, phone = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    await executeQuery(updateQuery, [full_name.trim(), bio || null, phone || null, location || null, userId]);

    // Log activity
    await logActivity(userId, 'profile_update', `Updated profile information`);

    // Get updated profile
    const updatedProfile = await executeQuery(
      'SELECT * FROM user_profiles WHERE user_id = ?', 
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile[0]
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Update user settings
 */
async function updateSettings(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }

    const settings = req.body;

    // Validate settings
    const validSettings = {
      email_notifications: Boolean(settings.email_notifications),
      push_notifications: Boolean(settings.push_notifications),
      marketing_communications: Boolean(settings.marketing_communications),
      profile_visibility: ['public', 'friends', 'private'].includes(settings.profile_visibility) 
        ? settings.profile_visibility : 'public',
      reading_activity: Boolean(settings.reading_activity),
      theme: ['auto', 'light', 'dark', 'gradient'].includes(settings.theme) 
        ? settings.theme : 'gradient',
      font_size: ['small', 'medium', 'large', 'extra-large'].includes(settings.font_size) 
        ? settings.font_size : 'medium'
    };

    // Check if settings exist, if not create them
    const existingSettings = await executeQuery(
      'SELECT id FROM user_settings WHERE user_id = ?', 
      [userId]
    );

    if (existingSettings.length === 0) {
      // Create settings
      const createQuery = `
        INSERT INTO user_settings (user_id, email_notifications, push_notifications, 
          marketing_communications, profile_visibility, reading_activity, theme, font_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(createQuery, [
        userId, validSettings.email_notifications, validSettings.push_notifications,
        validSettings.marketing_communications, validSettings.profile_visibility,
        validSettings.reading_activity, validSettings.theme, validSettings.font_size
      ]);
    } else {
      // Update settings
      const updateQuery = `
        UPDATE user_settings 
        SET email_notifications = ?, push_notifications = ?, marketing_communications = ?,
            profile_visibility = ?, reading_activity = ?, theme = ?, font_size = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;

      await executeQuery(updateQuery, [
        validSettings.email_notifications, validSettings.push_notifications,
        validSettings.marketing_communications, validSettings.profile_visibility,
        validSettings.reading_activity, validSettings.theme, validSettings.font_size,
        userId
      ]);
    }

    // Log activity
    await logActivity(userId, 'settings_change', 'Updated account settings');

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: validSettings
    });

  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update settings",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get user activity log
 */
async function getActivityLog(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }

    const query = `
      SELECT activity_type, activity_description, ip_address, created_at
      FROM user_activity_log 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const activities = await executeQuery(query, [userId, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Get Activity Log Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve activity log",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Helper Functions
 */

function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    conn.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function createProfileFromGoogle(user) {
  const userId = user.id || user.user_id || crypto.randomUUID();
  const profileData = {
    user_id: userId,
    full_name: user.displayName || user.name?.givenName + ' ' + user.name?.familyName || 'User',
    email: user.emails?.[0]?.value || user.email || '',
    account_type: 'google'
  };

  const profileQuery = `
    INSERT INTO user_profiles (user_id, full_name, email, account_type) 
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name), 
    email = VALUES(email),
    updated_at = CURRENT_TIMESTAMP
  `;

  await executeQuery(profileQuery, [
    profileData.user_id, 
    profileData.full_name, 
    profileData.email, 
    profileData.account_type
  ]);

  // Create default settings
  const settingsQuery = `
    INSERT INTO user_settings (user_id) 
    VALUES (?) 
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
  `;
  
  await executeQuery(settingsQuery, [userId]);

  // Log activity
  await logActivity(userId, 'login', 'User logged in via Google');

  return profileData;
}

function getDefaultSettings() {
  return {
    email_notifications: true,
    push_notifications: false,
    marketing_communications: false,
    profile_visibility: 'public',
    reading_activity: true,
    theme: 'gradient',
    font_size: 'medium'
  };
}

async function logActivity(userId, activityType, description, req = null) {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
    const userAgent = req?.get('User-Agent') || null;

    const query = `
      INSERT INTO user_activity_log (user_id, activity_type, activity_description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [userId, activityType, description, ipAddress, userAgent]);
  } catch (error) {
    console.error('Activity Log Error:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Middleware for profile creation if not exists
 */
async function ensureProfile(req, res, next) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }

    const profileQuery = 'SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1';
    const profile = await executeQuery(profileQuery, [userId]);

    if (profile.length === 0) {
      await createProfileFromGoogle(req.user);
    }

    next();
  } catch (error) {
    console.error('Ensure Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to ensure profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  getActivityLog,
  ensureProfile,
  createProfileFromGoogle
};