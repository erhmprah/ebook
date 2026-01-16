const express = require("express");

const addBook = require("../controller/admin/adminAddbook");
const insertBookApi = require("../apis/admin/insertBook");
const upload = require("./../middlewares/multer");
const router = express.Router();

router.get("/addbook", addBook);
router.post(
  "/insertbook",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "book", maxCount: 1 },
  ]),
  insertBookApi
);

module.exports = router;
 