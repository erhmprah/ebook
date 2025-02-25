const conn = require("../../connection");

async function detailsFetch(req, res) {
  const bookId = parseInt(req.query.id);
  const fetchQuery =
    "SELECT idbooks,title,Author,Discription,excerpt,status,price,image,book FROM books WHERE idbooks = ?";

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(fetchQuery, [bookId], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    const books = await promiseQuery();
    res.json(books);
  } catch (error) {
    console.log(error);
  }
}

module.exports = detailsFetch;
