const UserProfile = require("../../models/UserProfile");
const bcrypt = require("bcrypt");

async function loginPost(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserProfile.findOne({ email: email });

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(400).send({
        status: "error",
        message: "Account does not exist. Sign up to create an account",
      });
    }

    // Note: Since user_profiles doesn't store passwords directly,
    // we need to either:
    // 1. Add a password column to user_profiles
    // 2. Create a separate authentication mechanism
    // 3. Use Google OAuth as primary authentication

    // For now, we'll return a message indicating authentication setup is needed
    res.send({
      status: "success",
      message: "User found. Authentication setup required.",
      username: user.full_name,
      user_id: user.user_id,
      account_type: user.account_type
    });

    // TODO: Implement proper password verification here
    // Options:
    // 1. Add password field to user_profiles table
    // 2. Create user_auth table for credentials
    // 3. Use Google OAuth for authentication
    
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "An error occurred, please try again later",
    });
  }
}

module.exports = { loginPost };
