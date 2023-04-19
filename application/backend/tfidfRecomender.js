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
    //run("640b6eb11024425951abbfde");
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
    const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim().toLowerCase();

    if (cleanedWord !== "") {
      tokens.push(cleanedWord);
    }
  }

  //console.log(tokens);
  return tokens;
}

function fakeTokenize(document) {
  const arr = [];
  const splitText = document.split(" ");
  for(const word of splitText) {
    arr.push(word.toLowerCase());
  }
  return arr;
}

// compute the term frequency (tf) for a given word in a document
function tf(word, document) {
  const words = fakeTokenize(document);
  //const words = tokenize(document);
  const count = words.reduce((acc, w) => w === word ? acc + 1 : acc, 0); // count how many times the word appears in the document
  //console.log("TF: words = " + words.length + ", no. of appearances = " + count);
  return count / words.length; // divide the count by the total number of words in the document to get the term frequency
}

// compute the inverse document frequency (idf) for a given word across all documents
function idf(word, documents) {
  const docsContainingWord = documents.reduce((count, doc) => fakeTokenize(doc).includes(word) ? count + 1 : count, 0); // count how many documents contain the word
  //console.log("Docs containing word " + docsContainingWord);
  //console.log("Number of docs " + documents.length);
  //console.log(Math.log10(documents.length / docsContainingWord));
  //return Math.log10(documents.length / (1 + docsContainingWord)); // calculate the inverse document frequency
  return (Math.log10(documents.length / (docsContainingWord)));
}

// compute the tf-idf score for a given word in a document
function tfIdf(word, document, documents) {
  const tfScore = tf(word, document);
  const idfScore = idf(word, documents);
  console.log(`TF = ${tfScore}, IDF = ${idfScore}`);
  return tfScore * idfScore;
}

/*
async function run() {
  //const documents = ["This is the first document", "This is the second document with a cat", "And this is the third document"];
  const documents = ["Batman Strikes Again in this novel batman and robin fight muder", "Batman and superman fight side by side", "Robin fights criminals and murder part of series far back"];
  

  const inputBook = await Book.findOne({ _id: "640b6eb11024425951abbfde" });
  const tokens = tokenize(inputBook.title + " " + inputBook.description);
  console.log(tokens);

  let total = 0;

  for(let i = 0; i < documents.length; i++) {

    for(let j = 0; j < tokens.length; j++) {
      total += tfIdf(tokens[j], documents[i], documents);
    }

  }
  console.log(total);

}*/


//640b6eb11024425951abbfde batman vol 1
  /*
  const inputBook = await Book.findOne({ _id: bookId });
  const inputBookGenres = inputBook.genres;
  const databaseSample = await retrieveRelatedBooks(bookId, inputBookGenres);

  const tokenizedInputDocument = tokenize(inputBook.title + ' ' + inputBook.description); // tokenize the input book's title and description*/


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