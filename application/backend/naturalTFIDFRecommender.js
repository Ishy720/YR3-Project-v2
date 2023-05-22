/*
  This file contains the implementation for the TF-IDF recommendation system.
*/

//Imports
const { removeStopwords, eng } = require('stopword')
const Book = require("./models/BookSchema.js");
const mongoose = require("mongoose");
const natural = require('natural');
require("dotenv").config();

//DB Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("TF-IDF recommendation engine connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
});

//takes in text and removes stopwords, then tokenizes them (splits text into array of words)
function tokenize(text) {
    const splitText = text.split(" ");
    const relevantWordsArray = removeStopwords(splitText, eng);
    const tokens = [];

    for (const word of relevantWordsArray) {
      //removes punctuation from word and converts word to lowercase
      const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim().toLowerCase();
  
      if (cleanedWord !== "") {
        tokens.push(cleanedWord);
      }
    }
    return tokens;
}

async function retrieveRelatedBooks(bookId, genres) {

  const books = await Book.aggregate([
    //books which match at least one genre to the genres input array
    { $match: { genres: { $in: genres } } },
    //books that don't match the input book id
    { $match: { _id: { $ne: mongoose.Types.ObjectId(bookId) } } },
    //retrieve their information
    { $project: { _id: 1, title: 1, author: 1, releaseDate: 1, description: 1, imgurl: 1, genres: 1, avgRating: 1, likedPercentage: 1, ratingDistribution: 1 } }
  ]);
  
  return books;
}

//takes array of books and returns tokenized descriptions
function getTokenizedFeatures(books) {
  return books.map(book => tokenize(book.title + " " + book.author + " " + book.description));
}

//returns recommended books for given input book id
async function recommendFromOneBook(bookId) {

  //get the input book from the book database by its ID
  const inputBook = await Book.findOne({ _id: bookId });
  console.log(`Generating recommendations for ${inputBook.title}...`);
  const inputBookGenres = inputBook.genres;

  //get books to compare against which have at least one matching genre
  const databaseSample = await retrieveRelatedBooks(bookId, inputBookGenres);

  //get the bag of words representations of the comparison books
  const tokenizedFeatures = getTokenizedFeatures(databaseSample);

  //instantiate tfidf object from natural library
  const tfidf = new natural.TfIdf();

  //add the tokenized descriptions to the tfidf instance as a document
  for (const tokens of tokenizedFeatures) {
    tfidf.addDocument(tokens);
  }

  //array to hold the resulting recommendation books
  const recommendedBooks = [];

  //get the tf-idf score for the input book bag of word representation by summing TF-IDF score for each BOW token
  tfidf.tfidfs(tokenize(inputBook.title + " " + inputBook.author + " " + inputBook.description), (i, measure) => {
    recommendedBooks.push({
      book: databaseSample[i],
      score: measure
    });
  });

  //sort the recommended books by descending score
  recommendedBooks.sort((a, b) => b.score - a.score);

  //return the top 10 books
  return recommendedBooks.slice(0, 10);
}

//this function is used to test the time and memory performance of the recommendation system.
async function runTest() {
  //measure the initial memory usage and time
  const memoryBefore = process.memoryUsage().heapUsed
  const start = Date.now()
  recommendFromOneBook("640b6eb01024425951abb166")
    .then((result) => {
      const end = Date.now()
      const memoryUsed = process.memoryUsage().heapUsed
      //print the measured time taken and memory used
      console.log('Time taken:', (end - start)/1000, 's', '||', 'Memory used:', (memoryUsed - memoryBefore)/(1024 * 1024), 'MB');
      //print the books that were recommended
      result.forEach((book) => {
        console.log(book.book.title + "  " + book.score);
      });
    })
}

//runTest();

recommendFromOneBook("640b6eb01024425951abb166")
.then((result) => {
  result.forEach((book) => {
    console.log(book.book.title + "  " + book.score);
  });
})

exports.recommendFromOneBook = recommendFromOneBook;
