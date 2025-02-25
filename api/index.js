const express = require("express");
const qs = require("qs");
const path = require("path");

const app = express();

// Middleware for parsing URL-encoded data
app.use(
  express.urlencoded({ extended: true, parameterLimit: 100, queryParser: qs })
);

// Middleware for parsing JSON data
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes for users and admin
app.use("/", require("../routes/users"));
app.use("/admin", require("../routes/admin"));

// Serverless handler for Vercel
module.exports = (req, res) => {
  app(req, res); // Pass the request and response to Express
};
