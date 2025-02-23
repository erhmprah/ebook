const express = require("express");
const router = express.Router();
const path = require("path");
const { index, bookDetails, category } = require("../controller/users/users");
const indexFectch = require("../api/user/indexFetch");
const categoryFetch = require("../api/user/categoryFetch");
const detailsFetch = require("../api/user/detailsFetch");

router.get("/", index);

router.get("/bookdetails", bookDetails);
router.get("/category", category);
router.get("/indexFetch", indexFectch);
router.get("/categoryFetch", categoryFetch);
router.get("/detailsFetch", detailsFetch);

module.exports = router;
