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
    console.log("Cosine Recommendation engine connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
});

//takes in text and removes stopwords, then tokenizes them (splits text into array of words)
function tokenize(text) {
  const splitText = text.split(" ");
  const relevantWordsArray = removeStopwords(splitText, eng);
  const tokenSet = new Set();

  for (const word of relevantWordsArray) {
    const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim().toLowerCase();

    if (cleanedWord !== "") {
      tokenSet.add(cleanedWord);
    }
  }

  return tokenSet;
}

function wordCountMap(str){
  let words = str.split(' ');
  let wordCount = {};
  words.forEach((w)=>{
      wordCount[w] = (wordCount[w] || 0) + 1;

  });
  return wordCount;
}

function addWordsToDictionary(wordCountmap, dictionary) {
  for(let key in wordCountmap){
    dictionary[key] = true;
  }
}

function wordMapToVector(map, dictionary) {
  let wordCountVector = [];
  for (let term in dictionary){
      wordCountVector.push(map[term] || 0);
  }
  return wordCountVector;
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for(let i = 0; i < vecA.length; i++) {
      product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vector) {
  let sum = 0;
  for (let i = 0; i < vector.length; i++) {
      sum += vector[i] * vector[i];
  }
  return Math.sqrt(sum);
}

//cos(a,b) = a . b / ||a|| . ||b||
function cosineSimilarity(vecA, vecB){
  console.log(`Dot Product: ${dotProduct(vecA, vecB)}, Magnitudes: ${magnitude(vecA)}, ${magnitude(vecB)}`)
  return dotProduct(vecA, vecB)/ (magnitude(vecA) * magnitude(vecB));
}

function textCosineSimilarity(txtA, txtB){
  const wordCountA = wordCountMap(txtA);
  const wordCountB = wordCountMap(txtB);

  let dict = {};
  addWordsToDictionary(wordCountA, dict);
  addWordsToDictionary(wordCountB, dict);

  const vectorA = wordMapToVector(wordCountA, dict);
  const vectorB = wordMapToVector(wordCountB, dict);

  return cosineSimilarity(vectorA, vectorB);
}

function getSimilarityScore(value){
  return Math.round(value * 100)
}

/*
function test() {
  const A = "Harry Potter Chamber Secrets JKRowling Hogwarts School";
  const B = "Harry Potter Deathly Hallows JKRowling Voldemort School";
  const C = "Harry Potter Chamber Secrets JKRowling Hogwarts School";
  console.log(textCosineSimilarity(A, B));
}

test();*/

async function compareBooks(bookA, bookB) {

  const inputBook = await Book.findById(bookA).exec();
  const comparisonBook = await Book.findById(bookB).exec();

  const inputFeatures = inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description;
  const comparisonFeatures = comparisonBook.title + ' ' + comparisonBook.author + ' ' + comparisonBook.description;

  const score = getSimilarityScore(textCosineSimilarity(inputFeatures, comparisonFeatures));

  console.log(`Cosine similarity between ${inputBook.title} and ${comparisonBook.title}: ${score}`);
}

//compareBooks("640b6eb11024425951abbfde", "640b6eb11024425951abc9c8");


async function retrieveRelatedBooks(bookID) {

  const inputBook = await Book.findById(bookID).exec();
  const genres = inputBook.genres;
  const inputFeatures = Array.from(tokenize(inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description)).join(" ");

  //get related books in terms of genre
  const relatedBooks = await Book.aggregate([
    { $match: { genres: { $in: genres } } },
    { $project: { _id: 1, title: 1, author: 1, releaseDate: 1, description: 1, imgurl: 1, genres: 1, avgRating: 1, likedPercentage: 1, ratingDistribution: 1 } }
  ]).exec();

  const relatedBookScores = [];
  for (const relatedBook of relatedBooks) {
    const comparisonFeatures = Array.from(tokenize(relatedBook.title + ' ' + relatedBook.author + ' ' + relatedBook.description)).join(" ");;
    //const score = getSimilarityScore(textCosineSimilarity(inputFeatures, comparisonFeatures));
    const score = textCosineSimilarity(inputFeatures, comparisonFeatures);
    relatedBookScores.push({ id: relatedBook._id, title: relatedBook.title, score });
  }

  const sortedRelatedBooks = relatedBookScores.sort((a, b) => b.score - a.score);

    //print top 30 books
    for (let i = 0; i < 30 && i < sortedRelatedBooks.length; i++) {
      const { title, score } = sortedRelatedBooks[i];
      console.log(`${i}. ${title} - Cosine Similarity: (${score.toFixed(3)})`);
    }

}

retrieveRelatedBooks("640b6eb11024425951abbfde");
