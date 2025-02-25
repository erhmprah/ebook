const express = require("express");
const router = express.Router();
const path = require("path");
const {
  index,
  bookDetails,
  category,
  read,
} = require("../controller/users/users");
const indexFectch = require("../apis/user/indexFetch");
const categoryFetch = require("../apis/user/categoryFetch");
const detailsFetch = require("../apis/user/detailsFetch");

router.get("/", index);

router.get("/bookdetails", bookDetails);
router.get("/category", category);
router.get("/indexFetch", indexFectch);
router.get("/categoryFetch", categoryFetch);
router.get("/detailsFetch", detailsFetch);
router.get("/read", read);

module.exports = router;
