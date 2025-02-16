const express = require("express");

const addBook = require("../controller/admin/adminAddbook");
const insertBookApi = require("../api/admin/insertBook");
const upload = require("./../middlewares/multer");
const router = express.Router();

router.get("/addbook", addBook);
router.post("/insertbook", upload.single("image"), insertBookApi);

module.exports = router;
