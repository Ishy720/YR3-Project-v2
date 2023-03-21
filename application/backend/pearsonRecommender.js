const { removeStopwords, eng } = require('stopword')
const Book = require("./models/BookSchema.js");
const mongoose = require("mongoose");
require("dotenv").config();

//DB Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Recommendation engine connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
});

function tokenize(text) {
  const tokens = text.toLowerCase().split(/[^A-Za-z0-9]+/).filter(token => token.length > 0);
  return [...new Set(tokens)];
}

function pearsonCorrelation(book1, book2) {

}

function retrieveRelatedBooks(bookID) {

}

retrieveRelatedBooks("640b6eb31024425951ac0c6f");