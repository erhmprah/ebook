const UserProfile = require("../../models/UserProfile");
const UserSettings = require("../../models/UserSettings");
const UserActivityLog = require("../../models/UserActivityLog");
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

    const profile = await UserProfile.findOne({ user_id: userId });
    const settings = await UserSettings.findOne({ user_id: userId });

    if (!profile) {
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
        profile: profile,
        settings: settings || getDefaultSettings()
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

    await UserProfile.findOneAndUpdate(
      { user_id: userId },
      {
        full_name: full_name.trim(),
        bio: bio || null,
        phone: phone || null,
        location: location || null
      },
      { new: true }
    );

    // Log activity
    await logActivity(userId, 'profile_update', `Updated profile information`);

    // Get updated profile
    const updatedProfile = await UserProfile.findOne({ user_id: userId });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
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

    await UserSettings.findOneAndUpdate(
      { user_id: userId },
      validSettings,
      { upsert: true, new: true }
    );

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

    const activities = await UserActivityLog.find({ user_id: userId })
      .select('activity_type activity_description ip_address created_at')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

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


async function createProfileFromGoogle(user) {
  const userId = user.id || user.user_id || crypto.randomUUID();
  const profileData = {
    user_id: userId,
    full_name: user.displayName || user.name?.givenName + ' ' + user.name?.familyName || 'User',
    email: user.emails?.[0]?.value || user.email || '',
    account_type: 'google'
  };

  await UserProfile.findOneAndUpdate(
    { user_id: userId },
    profileData,
    { upsert: true, new: true }
  );

  // Create default settings
  await UserSettings.findOneAndUpdate(
    { user_id: userId },
    {},
    { upsert: true, new: true }
  );

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

    await UserActivityLog.create({
      user_id: userId,
      activity_type: activityType,
      activity_description: description,
      ip_address: ipAddress,
      user_agent: userAgent
    });
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

    const profile = await UserProfile.findOne({ user_id: userId });

    if (!profile) {
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

module.exports = getProfile;