const express = require("express");
const qs = require("qs");
const path = require("path");
const conn = require("./connection");
require("dotenv").config();
const port = process.env.PORT || 4000;
const cors = require("cors");
const app = express();

app.use(cors());

app.use(
  express.urlencoded({ extended: true, parameterLimit: 100, queryParser: qs })
);
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//get routes ...................
app.use("/", require("./routes/users"));
app.use("/admin", require("./routes/admin"));

app.listen(port, (err) => {
  if (err) {
    console.error(`cannot connect to ${port}`);
  } else {
    console.log(`listening to port ${port}`);
  }
});
