//Imports
const { removeStopwords, eng } = require('stopword')
const Book = require("./models/BookSchema.js");
const User = require("./models/UserSchema.js")
const mongoose = require("mongoose");
const natural = require('natural');
const TfIdf = natural.TfIdf;

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


function tokenize(text) {
    const splitText = text.split(" ");
    const relevantWordsArray = removeStopwords(splitText, eng);
    const tokenSet = new Set();

    for (const word of relevantWordsArray) {
      const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim();
  
      if (cleanedWord !== "") {
        tokenSet.add(cleanedWord);
      }
    }
  
    return Array.from(tokenSet);
}

async function retrieveRelatedBooks(genres) {
  const books = await Book.aggregate([
    { $match: { genres: { $in: genres } } },
    { $sample: { size: 10000 } },
    { $project: { _id: 1, title: 1, description: 1 } }
  ]).exec();

  return books;
}

function getTokenizedDescriptions(books) {
  return books.map(book => tokenize(book.description));
}

async function recommendBooks(userId) {

  //get user's finished books
  const user = await User.findOne({ _id: userId });
  const userFinishedBooks = user.finishedList;

  //if nothing in finished list return null
  if(userFinishedBooks.length == 0) {
    return null;
  }

  const chosenRandomBook = userFinishedBooks[Math.floor(Math.random() * (userFinishedBooks.length))];
  console.log("Generating recommendations for " + chosenRandomBook.title);
  const chosenRandomBookGenres = chosenRandomBook.genres;

  const databaseSample = await retrieveRelatedBooks(chosenRandomBookGenres);
  const tokenizedDescriptions = getTokenizedDescriptions(databaseSample);

  const tfidf = new natural.TfIdf();

  // add the tokenized descriptions to the tfidf instance
  for (const tokens of tokenizedDescriptions) {
    tfidf.addDocument(tokens);
  }

  const recommendedBooks = [];

  // get the tf-idf score for the chosen book
  tfidf.tfidfs(tokenize(chosenRandomBook.description), (i, measure) => {
    recommendedBooks.push({
      book: databaseSample[i],
      score: measure
    });
  });

  // sort the recommended books by score (descending)
  recommendedBooks.sort((a, b) => b.score - a.score);
  const topBooks = recommendedBooks.slice(0, 30);
  return topBooks;
}
  

recommendBooks("63ea439a88f303678100b11f")
  .then(response => {
    for(data in response) {
      console.log(response[data].book.title);
    }
  })
  .catch(error => console.error(error));