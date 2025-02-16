const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ebook",
});

conn.connect((err) => {
  if (err) {
    console.log(`cannot connect to database ${err}`);
  } else {
    console.log("database connected successfully");
  }
});

module.exports = conn;
