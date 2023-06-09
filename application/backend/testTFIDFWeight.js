/*
  This file is where I attempted to generate TF-IDF vectors for books. If I had extra time, I would optimise
  and complete this system.
*/

//Imports
const Book = require("./models/BookSchema.js");
const mongoose = require("mongoose");
const natural = require('natural');
const { removeStopwords, eng } = require('stopword')
require("dotenv").config();

//DB Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("test connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
});

//gets related books by genres given a book id
async function retrieveRelatedBooks(bookId, genres) {

  const books = await Book.aggregate([
    { $match: { genres: { $in: genres } } },
    { $match: { _id: { $ne: mongoose.Types.ObjectId(bookId) } } },
    { $sample: { size: 500 } },
    { $project: { _id: 1, title: 1, author: 1, releaseDate: 1, description: 1, imgurl: 1, genres: 1, avgRating: 1, likedPercentage: 1, ratingDistribution: 1 } }
  ]);

  return books;
}


//takes in text and removes stopwords, then tokenizes them (splits text into array of words). I only used this function to cut down on the 
//TF-IDF word comparisons to help improve the speed of the system for initial testing. This wouldn't be used if the system was complete and working.
function tokenize(text) {
  const splitText = text.split(" ");
  const relevantWordsArray = removeStopwords(splitText, eng);
  const tokenSet = [];

  for (const word of relevantWordsArray) {
    //removes punctuation from word and converts word to lowercase
    const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim().toLowerCase();

    if (cleanedWord !== "") {
      tokenSet.push(cleanedWord);
    }
  }

  return tokenSet;
}

//the test function where I would try and generate the tf-idf weightings.
async function testWeightingGeneration(bookId) {

  console.time('test');

  const inputBook = await Book.findOne({ _id: bookId });
  const booksToCompareAgainst = await retrieveRelatedBooks(bookId, inputBook.genres);

  //set up the tfidf object
  const tfidf = new natural.TfIdf();

  //get the input book words (tokenised to reduce words for comparisons to speed up initial testing)
  const inputBookTokens = tokenize(`${inputBook.title} ${inputBook.author} ${inputBook.description}`);

  //add the words to the tfidf object as a document
  tfidf.addDocument(inputBookTokens);

  //same process for the rest of the books for comparison.
  for (const relatedBook of booksToCompareAgainst) {
    const textTokens = tokenize(`${relatedBook.title} ${inputBook.author} ${relatedBook.description}`);
    tfidf.addDocument(textTokens);
  }

  //array to hold the tf-idf vector representations
  const tfidfVectors = {};

  //array to hold the input book vector representation
  const inputBookTfidf = {};

  //use the tfidfs() function to calculate the tf-idf weightings for the input book words against the corpus of words from all the other words 
  //from other books added as documents previously
  tfidf.tfidfs(inputBookTokens, (i, measure) => {
    inputBookTfidf[i] = measure;
  });

  //same tf-idf calculation process, but finding the tfidf weightings for each set of words for each comparison book instead
  booksToCompareAgainst.forEach((relatedBook) => {
    const relatedBookTfidf = {};
    const textTokens = tokenize(`${relatedBook.title} ${relatedBook.author} ${relatedBook.description}`);
    tfidf.tfidfs(textTokens, (i, measure) => {
      relatedBookTfidf[i] = measure;
    });
    tfidfVectors[relatedBook._id] = relatedBookTfidf;
  });

  //get the TF-IDF vector representation of the input book and print it out
  tfidfVectors[inputBook._id] = inputBookTfidf;
  for (const [wordIndex, weighting] of Object.entries(inputBookTfidf)) {
    console.log(`Word: "${inputBookTokens[wordIndex]}", tfidf weighting: ${weighting}.`);
  }

  
  console.timeEnd('test');
}


//pass a book ID into the function. The function will recommend books related to it.
testWeightingGeneration("640b6eb01024425951abacea")
  .then(response => {
    //console.log(`Response: ${response}`);        
  })
  .catch(error => console.error(error));
