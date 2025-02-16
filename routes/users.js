const express = require("express");
const router = express.Router();
const path = require("path");
const { index, bookDetails, category } = require("../controller/users/users");

router.get("/", index);

router.get("/bookdetails", bookDetails);
router.get("/category", category);

module.exports = router;
