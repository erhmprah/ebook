const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ones1mus@19",
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
