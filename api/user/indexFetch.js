const Book = require("../backend/models/Book");

async function indexFectch(req, res) {
  const category = req.query.category;

  try {
    // Handle '%' as wildcard to match all categories
    const query = category === '%' ? {} : { category: { $regex: category, $options: 'i' } };

    const books = await Book.find(query)
      .select('_id title author description category excerpt class image book price dateAdded')
      .limit(10); // Just limit to 10 for now

    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while fetching data");
  }
}

module.exports = indexFectch;
