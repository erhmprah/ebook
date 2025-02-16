const path = require("path");
function addBook(req, res) {
  res.sendFile(
    path.join(__dirname, "..", "..", "views", "adminViews", "insertBook.html")
  );
}

module.exports = addBook;
