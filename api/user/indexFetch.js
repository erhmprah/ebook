const conn = require("./../../connection");

async function indexFectch(req, res) {
  const fetchQuery =
    "SELECT title,author,image FROM books ORDER BY RAND() LIMIT 5";

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(fetchQuery, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    const [row] = await promiseQuery();
    res.json(row);
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occured fetching data");
  }
}

module.exports = indexFectch;
