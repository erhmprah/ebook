const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const conn = require('../../connection');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Configure multer for profile image uploads (using memory storage for serverless compatibility)
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
}).single('avatar');

/**
 * Upload and process profile avatar
 */
async function uploadAvatar(req, res) {
  upload(req, res, async (err) => {
    try {
      const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        });
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 5MB."
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const buffer = req.file.buffer;
      const userIdStr = userId.toString();
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');

      // Create different sizes
      const sizes = {
        thumbnail: { width: 150, height: 150, suffix: 'thumb' },
        medium: { width: 300, height: 300, suffix: 'medium' },
        large: { width: 500, height: 500, suffix: 'large' }
      };

      const avatarUrls = {};

      // Process each size and upload to Cloudinary
      for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
        const processedBuffer = await sharp(buffer)
          .resize(sizeConfig.width, sizeConfig.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        const publicId = `profile-avatars/${userIdStr}/${sizeName}_${timestamp}_${randomId}`;

        const result = await cloudinary.uploader.upload(processedBuffer, {
          folder: 'profile-avatars',
          public_id: `${userIdStr}/${sizeName}_${timestamp}_${randomId}`,
          resource_type: 'image'
        });

        avatarUrls[sizeName] = result.secure_url;
      }

      // Set original to large
      avatarUrls.original = avatarUrls.large;

      // Update database with new avatar URLs
      await updateUserAvatar(userId, avatarUrls);

      // Log activity
      await logActivity(userId, 'avatar_upload', 'Updated profile avatar', req);

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          avatar_urls: avatarUrls,
          file_sizes: Object.fromEntries(
            Object.entries(sizes).map(([key, config]) => [
              key,
              { width: config.width, height: config.height }
            ])
          )
        }
      });

    } catch (error) {
      console.error('Avatar Upload Error:', error);

      res.status(500).json({
        success: false,
        message: "Failed to process uploaded image",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
}

/**
 * Delete profile avatar
 */
async function deleteAvatar(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Get current avatar info
    const currentAvatar = await executeQuery(
      'SELECT avatar_url FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (!currentAvatar[0]?.avatar_url) {
      return res.status(404).json({
        success: false,
        message: "No avatar found to delete"
      });
    }

    let avatarData;
    try {
      // Try to parse as JSON first
      avatarData = JSON.parse(currentAvatar[0].avatar_url);
    } catch (parseError) {
      // If it's not JSON, it's probably a Google avatar URL, so just clear it
      await executeQuery(
        'UPDATE user_profiles SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [userId]
      );

      await logActivity(userId, 'avatar_delete', 'Cleared profile avatar', req);

      return res.json({
        success: true,
        message: "Avatar deleted successfully"
      });
    }

    // Delete avatar files from Cloudinary
    for (const size of ['thumbnail', 'medium', 'large']) {
      if (avatarData[size]) {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{timestamp}/{public_id}.{format}
        const url = avatarData[size];
        const urlParts = url.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0]; // Remove extension

        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Failed to delete ${size} avatar from Cloudinary:`, error.message);
          // Continue with other files even if one fails
        }
      }
    }

    // Update database to remove avatar
    await executeQuery(
      'UPDATE user_profiles SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [userId]
    );

    // Log activity
    await logActivity(userId, 'avatar_delete', 'Deleted profile avatar', req);

    res.json({
      success: true,
      message: "Avatar deleted successfully"
    });

  } catch (error) {
    console.error('Delete Avatar Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete avatar",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get user's current avatar info
 */
async function getAvatar(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const result = await executeQuery(
      'SELECT avatar_url FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (!result[0]?.avatar_url) {
      return res.json({
        success: true,
        data: {
          has_avatar: false,
          avatar_urls: null
        }
      });
    }

    let avatarData;
    try {
      // Try to parse as JSON (our uploaded avatars)
      avatarData = JSON.parse(result[0].avatar_url);

      // URLs are already full Cloudinary URLs
      return res.json({
        success: true,
        data: {
          has_avatar: true,
          avatar_urls: avatarData,
          uploaded_at: result[0].updated_at
        }
      });
    } catch (parseError) {
      // If it's not JSON, it might be a Google avatar URL (starts with http)
      const avatarUrl = result[0].avatar_url.trim();
      
      if (avatarUrl.startsWith('http')) {
        // This is likely a Google avatar URL
        return res.json({
          success: true,
          data: {
            has_avatar: true,
            avatar_urls: {
              large: avatarUrl,
              medium: avatarUrl,
              thumbnail: avatarUrl,
              original: avatarUrl
            },
            is_google_avatar: true,
            uploaded_at: result[0].updated_at
          }
        });
      } else {
        // Unknown format
        console.warn('Unknown avatar format:', avatarUrl);
        return res.json({
          success: true,
          data: {
            has_avatar: false,
            avatar_urls: null
          }
        });
      }
    }

  } catch (error) {
    console.error('Get Avatar Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get avatar information",
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

async function updateUserAvatar(userId, avatarUrls) {
  const query = `
    UPDATE user_profiles 
    SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = ?
  `;

  await executeQuery(query, [JSON.stringify(avatarUrls), userId]);
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
  }
}


module.exports = {
  getAvatar,
  uploadAvatar,
  deleteAvatar
};