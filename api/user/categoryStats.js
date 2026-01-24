const Book = require("../../models/Book");

/**
 * Get all categories with their book counts
 */
async function getCategoryStats(req, res) {
  try {
    const categories = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          book_count: { $sum: 1 },
          avg_price: { $avg: "$price" },
          min_price: { $min: "$price" },
          max_price: { $max: "$price" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format the response
    const formattedCategories = categories.map(category => ({
      name: category._id || 'Uncategorized',
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
    const stats = await Book.aggregate([
      { $match: { category: { $regex: category, $options: 'i' } } },
      {
        $group: {
          _id: null,
          book_count: { $sum: 1 },
          avg_price: { $avg: "$price" },
          min_price: { $min: "$price" },
          max_price: { $max: "$price" },
          unique_authors: { $addToSet: "$author" }
        }
      }
    ]);

    const categoryStats = stats[0] || {
      book_count: 0,
      avg_price: 0,
      min_price: 0,
      max_price: 0,
      unique_authors: []
    };

    // Get recent books in this category
    const recentBooks = await Book.find({ category: { $regex: category, $options: 'i' } })
      .select('_id title author image price dateAdded')
      .sort({ dateAdded: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Get author distribution for this category
    const topAuthors = await Book.aggregate([
      { $match: { category: { $regex: category, $options: 'i' } } },
      {
        $group: {
          _id: "$author",
          book_count: { $sum: 1 }
        }
      },
      { $sort: { book_count: -1 } },
      { $limit: 10 }
    ]);

    const formattedStats = {
      category: category,
      book_count: categoryStats.book_count,
      avg_price: categoryStats.avg_price ? parseFloat(categoryStats.avg_price).toFixed(2) : 0,
      min_price: categoryStats.min_price ? parseFloat(categoryStats.min_price).toFixed(2) : 0,
      max_price: categoryStats.max_price ? parseFloat(categoryStats.max_price).toFixed(2) : 0,
      unique_authors: categoryStats.unique_authors.length,
      is_empty: categoryStats.book_count === 0
    };

    res.json({
      success: true,
      data: {
        statistics: formattedStats,
        recent_books: recentBooks,
        top_authors: topAuthors.map(author => ({
          author: author._id,
          book_count: author.book_count
        }))
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