const express = require("express");
const qs = require("qs");
const path = require("path");
const conn = require("./connection");
require("dotenv").config();
const port = process.env.PORT || 4000;
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: "https://ebookman.vercel.app", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods as needed
  allowedHeaders: ["Content-Type", "Authorization"], // Add any custom headers your requests use
  credentials: true, // If sending cookies or credentials with requests
};

app.use(cors(corsOptions));

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
