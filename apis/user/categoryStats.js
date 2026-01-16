const conn = require("../../connection");

/**
 * Get all categories with their book counts
 */
async function getCategoryStats(req, res) {
  try {
    const query = `
      SELECT 
        category,
        COUNT(*) as book_count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM books 
      GROUP BY category
      ORDER BY category ASC
    `;

    const promiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    const categories = await promiseQuery();
    
    // Format the response
    const formattedCategories = categories.map(category => ({
      name: category.category || 'Uncategorized',
      book_count: category.book_count,
      avg_price: category.avg_price ? parseFloat(category.avg_price).toFixed(2) : 0,
      min_price: category.min_price ? parseFloat(category.min_price).toFixed(2) : 0,
      max_price: category.max_price ? parseFloat(category.max_price).toFixed(2) : 0,
      is_empty: category.book_count === 0
    }));

    // Calculate summary statistics
    const totalCategories = formattedCategories.length;
    const emptyCategories = formattedCategories.filter(cat => cat.is_empty).length;
    const totalBooks = formattedCategories.reduce((sum, cat) => sum + cat.book_count, 0);

    res.json({
      success: true,
      data: {
        categories: formattedCategories,
        summary: {
          total_categories: totalCategories,
          empty_categories: emptyCategories,
          populated_categories: totalCategories - emptyCategories,
          total_books: totalBooks,
          average_books_per_category: totalCategories > 0 ? (totalBooks / totalCategories).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get Category Stats Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get specific category details with additional statistics
 */
async function getCategoryDetails(req, res) {
  try {
    const { category } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category parameter is required"
      });
    }

    // Get category statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as book_count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        COUNT(DISTINCT author) as unique_authors
      FROM books 
      WHERE category LIKE ?
    `;

    // Get recent books in this category
    const booksQuery = `
      SELECT idbooks, title, author, image, price, created_at
      FROM books 
      WHERE category LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const statsPromiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(statsQuery, [category], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }
        });
      });
    };

    const booksPromiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(booksQuery, [category, parseInt(limit), parseInt(offset)], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    const [stats, recentBooks] = await Promise.all([
      statsPromiseQuery(),
      booksPromiseQuery()
    ]);

    // Get author distribution for this category
    const authorQuery = `
      SELECT author, COUNT(*) as book_count
      FROM books 
      WHERE category LIKE ?
      GROUP BY author
      ORDER BY book_count DESC
      LIMIT 10
    `;

    const authorPromiseQuery = () => {
      return new Promise((resolve, reject) => {
        conn.query(authorQuery, [category], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    const topAuthors = await authorPromiseQuery();

    const formattedStats = {
      category: category,
      book_count: stats.book_count,
      avg_price: stats.avg_price ? parseFloat(stats.avg_price).toFixed(2) : 0,
      min_price: stats.min_price ? parseFloat(stats.min_price).toFixed(2) : 0,
      max_price: stats.max_price ? parseFloat(stats.max_price).toFixed(2) : 0,
      unique_authors: stats.unique_authors,
      is_empty: stats.book_count === 0
    };

    res.json({
      success: true,
      data: {
        statistics: formattedStats,
        recent_books: recentBooks,
        top_authors: topAuthors
      }
    });

  } catch (error) {
    console.error('Get Category Details Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getCategoryStats,
  getCategoryDetails
};