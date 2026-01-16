const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const conn = require("../connection");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user data from Google profile
        const { id: google_id, displayName, name, emails, photos } = profile;
        const email = emails[0].value;
        const fullName = displayName;
        const avatar_url = photos[0] ? photos[0].value : null;
        
        // Generate unique user_id
        const user_id = `google_${google_id}_${Date.now()}`;
        const account_type = 'google';

        // Check if user already exists
        const checkUserQuery = "SELECT * FROM user_profiles WHERE email = ?";
        
        conn.query(checkUserQuery, [email], (err, results) => {
          if (err) {
            console.error("Error checking user:", err);
            return done(err);
          }
          
          if (results.length > 0) {
            // User exists, update their info if needed
            const updateQuery = `
              UPDATE user_profiles 
              SET full_name = ?, avatar_url = ?, last_login = NOW() 
              WHERE email = ?
            `;
            
            conn.query(updateQuery, [fullName, avatar_url, email], (updateErr) => {
              if (updateErr) {
                console.error("Error updating user:", updateErr);
                return done(updateErr);
              }
              
              // Return the user data for session
              const userData = {
                user_id: results[0].user_id,
                full_name: results[0].full_name,
                email: results[0].email,
                account_type: results[0].account_type
              };
              
              done(null, userData);
            });
          } else {
            // New user, insert into user_profiles
            const insertQuery = `
              INSERT INTO user_profiles (user_id, full_name, email, avatar_url, account_type, last_login)
              VALUES (?, ?, ?, ?, ?, NOW())
            `;
            
            conn.query(insertQuery, [user_id, fullName, email, avatar_url, account_type], (insertErr, result) => {
              if (insertErr) {
                console.error("Error inserting user:", insertErr);
                return done(insertErr);
              }
              
              // Also create default user settings for new users
              const settingsQuery = `
                INSERT INTO user_settings (user_id) VALUES (?)
              `;
              
              conn.query(settingsQuery, [user_id], (settingsErr) => {
                if (settingsErr) {
                  console.error("Error creating user settings:", settingsErr);
                  // Don't fail the auth if settings creation fails
                }
                
                // Return the new user data for session
                const userData = {
                  user_id,
                  full_name: fullName,
                  email,
                  account_type
                };
                
                done(null, userData);
              });
            });
          }
        });
        
      } catch (error) {
        console.error("Google OAuth error:", error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  done(null, user);
});

module.exports = passport;
