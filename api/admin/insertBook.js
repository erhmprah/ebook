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
  const image = req.file ? path.join("uploads/", req.file.filename) : "no";
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
    date,
  ];

  const insertQuery = `INSERT INTO books (title,Author,Discription,category,excerpt,class,level,status,price,image,dateAdded) VALUES(?,?,?,?,?,?,?,?,?,?,?)`;

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
