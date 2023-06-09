/*
  This file is where I initially tried to make the TF-IDF recommendation system without third party imports to assist in my calculations.
*/

//Imports
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
    console.log("TF-IDF engine connected to MongoDB");
    getRecommendations("640b6eb11024425951abbfde");
  })
  .catch((err) => {
    console.log(err);
});

async function retrieveRelatedBooks(genres) {

  const books = await Book.aggregate([
    { $match: { genres: { $in: genres } } },
    { $project: { _id: 1, title: 1, author: 1, releaseDate: 1, description: 1, imgurl: 1, genres: 1, avgRating: 1, likedPercentage: 1, ratingDistribution: 1 } }
  ]).exec();
  
  return books;
}

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

//compute the term frequency (tf) for a given word in a document
function tf(word, document) {
  const words = tokenize(document);
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    if (words[i] === word) {
      count++;
    }
  }
  return count / words.length; //divide the count by the total number of words in the document to get the term frequency
}

//compute the inverse document frequency (idf) for a given word across all documents
function idf(word, documents) {
  let docsContainingWord = 0;
  for (let i = 0; i < documents.length; i++) {
    let wordsInDoc = tokenize(documents[i]);
    if (wordsInDoc.includes(word)) {
      docsContainingWord++;
    }
  }
  return (Math.log10(documents.length / (docsContainingWord)));
}

//compute the tf-idf score for a given word in a document
function tfIdf(word, document, documents) {
  const tfScore = tf(word, document);
  const idfScore = idf(word, documents);
  //console.log(`TF = ${tfScore}, IDF = ${idfScore}`);
  return tfScore * idfScore;
}


async function getRecommendations(bookId) {
  
  const inputBook = await Book.findOne({ _id: bookId });
  //get the bag of words representation for the input book
  const inputBookTokens = tokenize(inputBook.title + " " +  inputBook.author + " " + inputBook.description);

  //get books to compare against which have at least one matching genre
  const databaseSample = await retrieveRelatedBooks(inputBook.genres);

  //array to hold book tfidf scores
  const bookScores = {};

  //loop through each word of the input book bag of words
  for (const token of inputBookTokens) {
    console.time(`Token ${token} comparison`);
    for (const book of databaseSample) {
      //get bag of words representation for comparison book
      const bookTokens = tokenize(book.title + " " + book.author + " " + book.description);
      //calculate tf-idf weighting for the input book token against the words found in the comparison book bag of words.
      const tfIdfScore = tfIdf(token, bookTokens.join(" "), databaseSample.map(b => b.title + " " + b.author + " " + b.description));

      //add the token scores to the book array
      if (book._id in bookScores) {
        bookScores[book._id] += tfIdfScore;
      } 
      else {
        bookScores[book._id] = tfIdfScore;
      }
    }
    console.timeEnd(`Token ${token} comparison`);
  }

}


//640b6eb11024425951abbfde batman vol 1
  /*
  const inputBook = await Book.findOne({ _id: bookId });
  const inputBookGenres = inputBook.genres;
  const databaseSample = await retrieveRelatedBooks(bookId, inputBookGenres);

  const tokenizedInputDocument = tokenize(inputBook.title + ' ' + inputBook.description); // tokenize the input book's title and description*/

/*
const documents = ["This is the first document", "This is the second document with a cat", "And this is the third document"];
const word = "cat";
const documentIndex = 1;

console.log(`TF-IDF score for word ${word} in document ${documents[documentIndex]} is ${tfIdf(word, documents[documentIndex], documents)}`)


const documents2 = ["Batman Strikes Again novel batman robin fight", 
"Batman superman fight side by side", 
"superman against evil superman"];
const word2 = "superman";
const documentIndex2 = 2;

console.log(`TF-IDF score for word ${word2} in document ${documents2[documentIndex2]} is ${tfIdf(word2, documents2[documentIndex2], documents2)}`)
//console.log(`TF-IDF score for word ${word} in document ${documents[1]} is ${tfIdf(word, documents[documentIndex], documents)}`)
//console.log(`TF-IDF score for word ${word} in document ${documents[2]} is ${tfIdf(word, documents[documentIndex], documents)}`)*/