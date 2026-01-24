const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserProfile = require("../models/UserProfile");
const UserSettings = require("../models/UserSettings");
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
        let existingUser = await UserProfile.findOne({ email: email });

        if (existingUser) {
          // User exists, update their info if needed
          existingUser.full_name = fullName;
          existingUser.avatar_url = avatar_url;
          existingUser.last_login = new Date();
          await existingUser.save();

          // Return the user data for session
          const userData = {
            user_id: existingUser.user_id,
            full_name: existingUser.full_name,
            email: existingUser.email,
            account_type: existingUser.account_type
          };

          done(null, userData);
        } else {
          // New user, create profile
          const newUser = await UserProfile.create({
            user_id,
            full_name: fullName,
            email,
            avatar_url,
            account_type,
            last_login: new Date()
          });

          // Also create default user settings for new users
          try {
            await UserSettings.create({ user_id });
          } catch (settingsErr) {
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
        }

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
