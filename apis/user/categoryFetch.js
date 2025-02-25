const conn = require("./../../connection");

async function categoryFetch(req, res) {
  const category = req.query.category;
  const offset = parseInt(req.query.offset) || 0;
  const limit = 10;

  const fetchQuery =
    "SELECT idbooks,title,image, author, title FROM books WHERE category LIKE ?  LIMIT ? OFFSET ?";
  const countQuery =
    "SELECT COUNT(idbooks) AS total FROM books WHERE category LIKE ?";

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(fetchQuery, [category, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

    const countPromiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(countQuery, [category], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0].total);
          }
        });
      });
    };

    const rows = await promiseQuery();
    const count = await countPromiseQuery();
    res.json({
      books: rows,
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = categoryFetch;
