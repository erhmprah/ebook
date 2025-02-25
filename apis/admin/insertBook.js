const connection = require("../../connection");
const path = require("path");

async function insertBookApi(req, res) {
  const title = req.body.title;
  const author = req.body.author;
  const discription = req.body.description;
  const category = req.body.category;
  const excerpt = req.body.excerpt;
  const _class = req.body.class;
  const level = req.body.level;
  const status = req.body.status;
  const price = req.body.price;
  const date = req.body.date;
  const imageFile = req.files["image"] ? req.files["image"][0] : null; // First image file
  const bookFile = req.files["book"] ? req.files["book"][0] : null; // First book file

  // Get the file paths or set default values
  const image = imageFile ? path.join("uploads", imageFile.filename) : "no";
  const book = bookFile ? path.join("uploads", bookFile.filename) : "no";

  const values = [
    title,
    author,
    discription,
    category,
    excerpt,
    _class,
    level,
    status,
    price,
    image,
    book,
    date,
  ];

  const insertQuery = `INSERT INTO books (title,Author,Discription,category,excerpt,class,level,status,price,image,book,dateAdded) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        connection.query(insertQuery, values, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    const results = await promiseQuery();
    res.send(`bookinserted successfully with an id of ${results.insertId}`);
  } catch (error) {
    console.log(error.stack);
  }
}

module.exports = insertBookApi;
