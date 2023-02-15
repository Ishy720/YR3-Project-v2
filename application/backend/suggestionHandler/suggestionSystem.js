//Imports
const Book = require("../models/BookSchema.js");
const User = require("../models/UserSchema.js");
const mongoose = require("mongoose");
require("dotenv").config();

//DB Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
});

//returns other books written by same author based off of one book id, sorted by avgRating
async function retrieveRelatedBooksByAuthor(bookId) {
  const book = await Book.findOne({ _id: bookId }).exec();
  if (!book) {
      console.log(`Book with id ${bookId} not found`);
  }
  const author = book.author.split(",")[0];

  const regex = new RegExp(`^${author.split(" ").join(".*")}$`, "i");

  const relatedBooks = await Book.aggregate([
      { $match: { author: { $regex: regex } } },
      { $match: { _id: { $ne: bookId } } },
      { $sample: { size: 10 } },
      { $sort: { avgRating: -1 } }
  ]).exec();

  if (relatedBooks.length === 0) {
      console.log(`No related books found for author ${author}`);
  }

  return relatedBooks;
};

/*
export async function retrieveRelatedBooks(genreArray) {
    const regex = new RegExp(genreArray.join("|"), "i");
    return await Book.find({ genres: { $in: [regex] } }).exec();
};*/

//returns up to a max of 10 random books for each genre in the input array, sorted by avgRating
async function retrieveRelatedBooks(genreArray) {
  return Promise.all(
      genreArray.map(async genre => {
          const regex = new RegExp(genre, "i");
          return await Book.aggregate([
              { $match: { genres: regex } },
              { $sample: { size: 10 } },
              { $sort: { avgRating: -1 } }
          ]).exec();
      })
  );
};

/*
const uniqueUserInputGenres = ['Action', 'Adventure'];
retrieveRelatedBooks(uniqueUserInputGenres).then(output => {
    const result = output.sort(({avgRating:a}, {avgRating:b}) => b-a);
    console.log(result[0]);
});*/



//const bookId = "63d53dcd0dcdd4cc1d1251ac" //twilight - author name is fine and only contains one author name
const bookId = "63d53dcd0dcdd4cc1d1251c2"; //harry potter book - author name has multiple people and () which is wrong
retrieveRelatedBooksByAuthor(bookId).then(output => {
  console.log(output);
});
