const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://erhmprah:60Gvp4UcHBRzuH3f@cluster0.cdepkcl.mongodb.net/";

mongoose.connect(mongoURI)
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((err) => {
  console.log(`Cannot connect to MongoDB: ${err}`);
});

module.exports = mongoose;
