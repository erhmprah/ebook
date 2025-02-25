const path = require("path");

function index(req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "views", "index.html"));
}
function bookDetails(req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "views", "bookdetails.html"));
}
function category(req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "views", "category.html"));
}
function read(req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "views", "bookDisplay.html"));
}

module.exports = { index, bookDetails, category, read };
