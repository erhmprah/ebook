const crypto = require('crypto');
const conn = require('../../connection');

/**
 * Get user active sessions
 */
async function getActiveSessions(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const currentSessionToken = req.sessionID || req.user.sessionToken || req.headers['x-session-token'];

    const query = `
      SELECT 
        id, session_token, ip_address, user_agent, device_info, 
        is_active, created_at, last_accessed, expires_at,
        CASE 
          WHEN session_token = ? THEN 'current'
          ELSE 'active'
        END as session_status
      FROM user_sessions 
      WHERE user_id = ? AND is_active = 1 AND expires_at > NOW()
      ORDER BY last_accessed DESC
    `;

    const sessions = await executeQuery(query, [currentSessionToken, userId]);

    // Mask session tokens for security
    const maskedSessions = sessions.map(session => ({
      ...session,
      session_token: session.session_token.substring(0, 8) + '...' + session.session_token.substring(session.session_token.length - 4),
      session_status: session.session_status
    }));

    res.json({
      success: true,
      data: {
        sessions: maskedSessions,
        current_session_id: sessions.find(s => s.session_status === 'current')?.id,
        total_sessions: sessions.length
      }
    });

  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve active sessions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Terminate a specific session
 */
async function terminateSession(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    const { sessionId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Get current session token to prevent terminating current session if it's the same
    const currentSessionToken = req.sessionID || req.user.sessionToken || req.headers['x-session-token'];

    const session = await executeQuery(
      'SELECT session_token FROM user_sessions WHERE id = ? AND user_id = ? AND is_active = 1',
      [sessionId, userId]
    );

    if (session.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Prevent terminating current session
    if (session[0].session_token === currentSessionToken) {
      return res.status(400).json({
        success: false,
        message: "Cannot terminate current session"
      });
    }

    await executeQuery(
      'UPDATE user_sessions SET is_active = 0 WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    // Update session count
    await executeQuery(
      'UPDATE user_settings SET session_count = session_count - 1 WHERE user_id = ?',
      [userId]
    );

    // Log activity
    await logActivity(userId, 'session_terminate', `Terminated session ${sessionId}`, req);

    res.json({
      success: true,
      message: "Session terminated successfully"
    });

  } catch (error) {
    console.error('Terminate Session Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to terminate session",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Terminate all other sessions except current
 */
async function terminateAllOtherSessions(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const currentSessionToken = req.sessionID || req.user.sessionToken || req.headers['x-session-token'];

    // Get count of sessions to be terminated
    const sessionsToTerminate = await executeQuery(
      'SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ? AND session_token != ? AND is_active = 1',
      [userId, currentSessionToken]
    );

    const terminatedCount = sessionsToTerminate[0].count;

    if (terminatedCount === 0) {
      return res.json({
        success: true,
        message: "No other sessions found to terminate"
      });
    }

    await executeQuery(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND session_token != ?',
      [userId, currentSessionToken]
    );

    // Update session count
    await executeQuery(
      'UPDATE user_settings SET session_count = 1 WHERE user_id = ?',
      [userId]
    );

    // Log activity
    await logActivity(userId, 'sessions_terminate_all', `Terminated ${terminatedCount} other sessions`, req);

    res.json({
      success: true,
      message: `Successfully terminated ${terminatedCount} other session(s)`,
      data: { terminated_count: terminatedCount }
    });

  } catch (error) {
    console.error('Terminate All Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to terminate sessions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Create new session
 */
async function createSession(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.get('User-Agent');
    const deviceInfo = getDeviceInfo(userAgent);

    const query = `
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, device_info, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [userId, sessionToken, ipAddress, userAgent, deviceInfo, expiresAt]);

    // Update session count and last login
    await executeQuery(
      'UPDATE user_profiles SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [userId]
    );

    await executeQuery(
      'UPDATE user_settings SET session_count = session_count + 1 WHERE user_id = ?',
      [userId]
    );

    // Log activity
    await logActivity(userId, 'session_create', 'New session created', req);

    res.json({
      success: true,
      message: "Session created successfully",
      data: {
        session_token: sessionToken,
        expires_at: expiresAt
      }
    });

  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create session",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const result = await executeQuery(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND expires_at < NOW()',
      [userId]
    );

    const cleanedCount = result.affectedRows;

    if (cleanedCount > 0) {
      // Update session count
      await executeQuery(
        'UPDATE user_settings SET session_count = (SELECT COUNT(*) FROM user_sessions WHERE user_id = ? AND is_active = 1 AND expires_at > NOW()) WHERE user_id = ?',
        [userId, userId]
      );
    }

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired session(s)`,
      data: { cleaned_count: cleanedCount }
    });

  } catch (error) {
    console.error('Cleanup Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup expired sessions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Delete user account
 */
async function deleteAccount(req, res) {
  try {
    const userId = req.user.id || req.user.user_id || req.user.profile?.user_id;
    const { confirmationText } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Verify confirmation text
    if (confirmationText !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: "Account deletion requires confirmation. Type 'DELETE' to confirm."
      });
    }

    // Get user info before deletion for activity log
    const userInfo = await executeQuery(
      'SELECT full_name, email FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (userInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    // Delete avatar files if they exist
    const avatarData = await executeQuery(
      'SELECT avatar_url FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (avatarData[0]?.avatar_url) {
      try {
        const parsedAvatar = JSON.parse(avatarData[0].avatar_url);
        const fs = require('fs').promises;
        const path = require('path');
        const uploadDir = path.join(__dirname, '../../uploads/profile-avatars');

        for (const size of ['thumbnail', 'medium', 'large']) {
          if (parsedAvatar[size]) {
            const fileName = path.basename(parsedAvatar[size]);
            const filePath = path.join(uploadDir, fileName);
            await fs.unlink(filePath);
          }
        }
      } catch (fileError) {
        console.error('Error deleting avatar files:', fileError);
        // Continue with account deletion even if avatar deletion fails
      }
    }

    // Delete from database (CASCADE will handle related records)
    await executeQuery('DELETE FROM user_profiles WHERE user_id = ?', [userId]);

    // Log activity (this might fail due to cascade deletion, but that's ok)
    try {
      await logActivity(userId, 'account_delete', `Deleted account for ${userInfo[0].email}`, req);
    } catch (logError) {
      console.error('Activity log error (expected due to cascade):', logError);
    }

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
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

function getDeviceInfo(userAgent) {
  if (!userAgent) return 'Unknown Device';
  
  // Simple device detection
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  if (userAgent.includes('Tablet')) return 'Tablet Device';
  if (userAgent.includes('Windows')) return 'Windows Desktop';
  if (userAgent.includes('Mac')) return 'Mac Desktop';
  if (userAgent.includes('Linux')) return 'Linux Desktop';
  
  return 'Unknown Device';
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
  getActiveSessions,
  terminateSession,
  terminateAllOtherSessions,
  createSession,
  cleanupExpiredSessions,
  deleteAccount
};