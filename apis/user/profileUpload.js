const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const crypto = require('crypto');
const conn = require('../../connection');

/**
 * Configure multer for profile image uploads
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profile-avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    cb(null, fileName);
  }
});

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

      const originalPath = req.file.path;
      const fileName = req.file.filename;
      const baseName = path.parse(fileName).name;
      const extension = path.extname(fileName);

      // Create different sizes
      const sizes = {
        thumbnail: { width: 150, height: 150, suffix: 'thumb' },
        medium: { width: 300, height: 300, suffix: 'medium' },
        large: { width: 500, height: 500, suffix: 'large' }
      };

      const processedFiles = {};

      // Process each size
      for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
        const outputPath = path.join(
          path.dirname(originalPath),
          `${baseName}_${sizeConfig.suffix}${extension}`
        );

        await sharp(originalPath)
          .resize(sizeConfig.width, sizeConfig.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85, progressive: true })
          .toFile(outputPath);

        processedFiles[sizeName] = path.basename(outputPath);
      }

      // Delete the original uploaded file
      await fs.unlink(originalPath);

      // Generate relative URLs for the processed files (shorter than full URLs)
      const avatarUrls = {
        thumbnail: processedFiles.thumbnail,
        medium: processedFiles.medium,
        large: processedFiles.large,
        original: processedFiles.large
      };

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
      
      // Clean up uploaded file if processing failed
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }

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
    
    // Delete avatar files from disk
    const uploadDir = path.join(__dirname, '../../uploads/profile-avatars');
    
    for (const size of ['thumbnail', 'medium', 'large']) {
      if (avatarData[size]) {
        const fileName = avatarData[size];
        const filePath = path.join(uploadDir, fileName);
        
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete ${size} avatar:`, error.message);
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
      
      // Convert relative paths to full URLs
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/profile-avatars`;
      const fullAvatarUrls = {};
      
      for (const [size, fileName] of Object.entries(avatarData)) {
        fullAvatarUrls[size] = `${baseUrl}/${fileName}`;
      }

      return res.json({
        success: true,
        data: {
          has_avatar: true,
          avatar_urls: fullAvatarUrls,
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

/**
 * Middleware to ensure upload directory exists
 */
async function ensureUploadDir(req, res, next) {
  try {
    const uploadDir = path.join(__dirname, '../../uploads/profile-avatars');
    await fs.mkdir(uploadDir, { recursive: true });
    next();
  } catch (error) {
    console.error('Ensure Upload Dir Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to prepare upload directory"
    });
  }
}

module.exports = uploadAvatar;