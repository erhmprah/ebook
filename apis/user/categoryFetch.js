const conn = require("./../../connection");

async function categoryFetch(req, res) {
  const category = req.query.category;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const showAll = req.query.showAll === 'true';

  let fetchQuery;
  let countQuery;
  
  if (showAll) {
    // Fetch all books without pagination
    fetchQuery = "SELECT idbooks, title, Author, Discription, category, excerpt, class, image, book, price, dateAdded FROM books WHERE category LIKE ?";
    countQuery = "SELECT COUNT(idbooks) AS total FROM books WHERE category LIKE ?";
  } else {
    // Fetch with pagination (existing behavior)
    fetchQuery = "SELECT idbooks, title, Author, Discription, category, excerpt, class, image, book, price, dateAdded FROM books WHERE category LIKE ? LIMIT ? OFFSET ?";
    countQuery = "SELECT COUNT(idbooks) AS total FROM books WHERE category LIKE ?";
  }

  try {
    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        let queryParams;
        if (showAll) {
          // For showAll, only pass category
          queryParams = [category];
        } else {
          // For pagination, pass category, limit, and offset
          queryParams = [category, limit, offset];
        }
        
        conn.query(fetchQuery, queryParams, (err, rows) => {
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
