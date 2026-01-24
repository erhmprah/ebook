const UserProfile = require("../backend/models/UserProfile");
const bcrypt = require("bcrypt");
const path = require("path");

async function registerUser(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  try {
    // Check if the email already exists
    const existingUser = await UserProfile.findOne({ email: email });

    if (existingUser) {
      return res
        .status(400)
        .render(path.join(__dirname, "..", "views", "signupFailure.ejs"), {
          message: "Email already exist login instead",
          buttonText: "Login",
        });
    }

    // Proceed with hashing the password if email is unique
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    // Note: Since user_profiles doesn't have a password field, we'll need a separate authentication approach
    // For now, we'll insert into user_profiles and handle password separately

    // Generate a unique user_id using timestamp + random number
    const user_id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await UserProfile.create({
      user_id: user_id,
      full_name: username,
      email: email,
      account_type: 'email'
    });

    // Insert password into a separate auth table or handle separately
    // For now, we'll just create a basic user entry
    return res.status(200).redirect("/success");

  } catch (error) {
    console.log("Cannot register user", error);
    res
      .status(500)
      .render(path.join(__dirname, "..", "views", "signupFailure.ejs"), {
        message: "Sign up error ",
        buttonText: "Try again",
      });
  }
}

module.exports = registerUser;
