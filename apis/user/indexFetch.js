const conn = require("./../../connection");

async function indexFectch(req, res) {
  const category = req.query.category;
  const fetchQuery = `SELECT idbooks, title, Author, Discription, category, excerpt, class, image, book, price, dateAdded FROM books WHERE category LIKE ? ORDER BY RAND() LIMIT 10`;

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(fetchQuery, [`%${category}%`], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    const row = await promiseQuery();
    res.json(row);
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while fetching data");
  }
}

module.exports = indexFectch;
