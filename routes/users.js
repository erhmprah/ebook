const express = require("express");
const router = express.Router();
const path = require("path");
const { index, bookDetails, category } = require("../controller/users/users");
const indexFectch = require("../api/user/indexFetch");

router.get("/", index);

router.get("/bookdetails", bookDetails);
router.get("/category", category);
router.get("/indexFetch", indexFectch);

module.exports = router;
