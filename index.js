const express = require("express");
const qs = require("qs");
const path = require("path");
require("dotenv").config();
const port = process.env.PORT || 4000;
const cors = require("cors");
const passport = require("./middlewares/passport");
const session = require("express-session");
const secretKey = require("./middlewares/crypto");

// Connect to MongoDB
require("./connection");

const app = express();

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);
//
app.use(passport.session());
app.use(passport.initialize());

//

//
//
//

app.use(cors());
//
//
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  express.urlencoded({ extended: true, parameterLimit: 1000, queryParser: qs })
);
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/profile-avatars", express.static(path.join(__dirname, "uploads/profile-avatars")));

//get routes ...................
app.use("/", require("./routes/users"));
app.use("/admin", require("./routes/admin"));
app.use("/pdf", require("./routes/pdf"));

// Test routes
// NOTE: Removed test PDF debug page. Use the regular reader at /read which
// uses `views/bookDisplay.html` and serves PDFs from the /pdf/:filename route.

if (require.main === module) {
  app.listen(port, (err) => {
    if (err) {
      console.error(`cannot connect to ${port}`);
    } else {
      console.log(`listening to port ${port}`);
    }
  });
} else {
  module.exports = app;
}
