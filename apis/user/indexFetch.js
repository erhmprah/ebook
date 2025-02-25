const conn = require("./../../connection");

async function indexFectch(req, res) {
  const category = req.query.category;
  const fetchQuery = `SELECT idbooks,title,author,image FROM books WHERE category LIKE ? ORDER BY RAND() LIMIT 10 `;

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(fetchQuery, [category], (err, row) => {
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
    res.status(500).send("An error occured fetching data");
  }
}

module.exports = indexFectch;
