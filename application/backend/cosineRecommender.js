/*
  This file contains the implementation for the cosine recommendation system.
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
    console.log("Cosine Recommendation engine connected to MongoDB");
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

//function used to map the frequency of words within an input string
function wordCountMap(text) {
  const words = text.split(' ');
  const wordFrequencyMap = {};
  
  words.forEach((word) => {
    //checks if the word is already a key in the wordsFrequencyMap. if not, initialises that word and its count to 1
    //if the word exists as a key, its current count is retrieved by wordFrequencyMap[word] and incremented by 1
    wordFrequencyMap[word] = (wordFrequencyMap[word] || 0) + 1;
  });
  
  return wordFrequencyMap;
}

//creates a dictionary of word keys from a frequency map to see which words exist (set as true)
function addWordsToDictionary(wordFrequencyMap, dictionary) {
  for(let word in wordFrequencyMap) {
    dictionary[word] = true;
  }
}

//produces word frequency vector given a frequency map of words and dictionary of existing words
function generateWordFrequencyVector(wordFrequencyMap, dictionary) {

  //array to store word frequency vector
  const wordFrequencyVector = [];
  
  //go through each expected word in the dictionary
  for (let word in dictionary) {
    //check if word exists in frequency map
    if (wordFrequencyMap[word]) {
      //push the frequency value into the frequency vector
      wordFrequencyVector.push(wordFrequencyMap[word]);
    } else {
      //word doesn't exist, push 0 to show lack of frequency
      wordFrequencyVector.push(0);
    }
  }
  
  return wordFrequencyVector;
}

//returns dot product of two vectors
function dotProduct(vecA, vecB) {
  let product = 0;
  for(let i = 0; i < vecA.length; i++) {
      product += vecA[i] * vecB[i];
  }
  return product;
}

//returns magnitute of a vector
function magnitude(vector) {
  let sum = 0;
  for (let i = 0; i < vector.length; i++) {
      sum += vector[i] * vector[i];
  }
  return Math.sqrt(sum);
}

//calculates and returns the cosine similarity between two vectors in multi-dimension space
function cosineSimilarity(vecA, vecB){
  //console.log(`Dot Product: ${dotProduct(vecA, vecB)}, Magnitudes: ${magnitude(vecA)}, ${magnitude(vecB)}`)

  //cos(a,b) = a . b / ||a|| . ||b||
  return dotProduct(vecA, vecB)/ (magnitude(vecA) * magnitude(vecB));
}

//calculates the cosine similarity between two input strings
function textCosineSimilarity(textA, textB) {
  //get the word frequencies of the inputs
  const wordFrequencyMapA = wordCountMap(textA);
  const wordFrequencyMapB = wordCountMap(textB);

  //get the complete dictionary of words from the two input strings
  const dictionary = {};
  addWordsToDictionary(wordFrequencyMapA, dictionary);
  addWordsToDictionary(wordFrequencyMapB, dictionary);

  //create the frequency vectors for the two input strings
  const wordFrequencyVectorA = generateWordFrequencyVector(wordFrequencyMapA, dictionary);
  const wordFrequencyVectorB = generateWordFrequencyVector(wordFrequencyMapB, dictionary);

  //return calculated cosine similarity between the two vectors
  return cosineSimilarity(wordFrequencyVectorA, wordFrequencyVectorB);
}

/*
function getSimilarityScore(value){
  return Math.round(value * 100)
}*/

//takes an array of genres and retrieves randomized sample of books which regex match the input genres array
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

//function to produce similar book recommendations given its id as a parameter input
async function recommendForBook(bookID) {

  //get the input book from the book database by its ID
  const inputBook = await Book.findById(bookID);
  const genres = inputBook.genres;

  //get the bag of words representation for the input book
  const inputFeatures = tokenize(inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description).join(" ");

  //get books to compare against which have at least one matching genre
  const relatedBooks = await retrieveRelatedBooks(bookID, genres);

  //array to hold the cosine similarity scores of books in
  const relatedBookScores = [];

  //iterate through the books to compare against
  for (const relatedBook of relatedBooks) {
    //get bag of words representation of the comparison book
    const comparisonFeatures = tokenize(relatedBook.title + ' ' + relatedBook.author + ' ' + relatedBook.description).join(" ");

    
    //calculate the text cosine similarity between the input book bag of words and the comparison book bag of words
    const score = textCosineSimilarity(inputFeatures, comparisonFeatures);
    //const score = getSimilarityScore(textCosineSimilarity(inputFeatures, comparisonFeatures));

    relatedBookScores.push({ id: relatedBook._id, title: relatedBook.title, score });
  }

  //sort the scored books by descending score and return the top books
  const sortedRelatedBooks = relatedBookScores.sort((a, b) => b.score - a.score);
  return sortedRelatedBooks.splice(0, 6);
    /*
    //print top 6 books
    for (let i = 0; i < 30 && i < sortedRelatedBooks.length; i++) {
      const { title, score } = sortedRelatedBooks[i];
      console.log(`${i + 1}. ${title} - Cosine Similarity: (${score.toFixed(3)})`);
    }*/

}

recommendForBook("640b6eb01024425951abb166")
.then((result) => {
  console.log(result);
})

//this function is used to test the time and memory performance of the recommendation system.
async function runTest() {
  //measure the initial memory usage and time
  const memoryBefore = process.memoryUsage().heapUsed
  const start = Date.now()
  recommendForBook("640b6eb01024425951abb166")
    .then((result) => {
      const end = Date.now()
      const memoryAfter = process.memoryUsage().heapUsed
      //print the measured time taken and memory used
      console.log('Time', (end - start) / 1000, 's', '||', 'Memory used:', (memoryAfter - memoryBefore) / (1024 * 1024), 'MB');
      //print the books that were recommended
      console.log(result);
    })
}

//runTest();

//test function to compare two books specifically
async function compareBooks(bookA, bookB) {

  const inputBook = await Book.findById(bookA).exec();
  const comparisonBook = await Book.findById(bookB).exec();

  const inputFeatures = inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description;
  const comparisonFeatures = comparisonBook.title + ' ' + comparisonBook.author + ' ' + comparisonBook.description;

  const score = getSimilarityScore(textCosineSimilarity(inputFeatures, comparisonFeatures));

  console.log(`Cosine similarity between ${inputBook.title} and ${comparisonBook.title}: ${score}`);
}


/*
//INPUT BOOK
"640b6eb01024425951abb0a8" fantastic beasts and where to find them

//RELEVANT BOOKS
"640b6eb01024425951abacea" order of phoenix
"640b6eb01024425951abad03" scorcers stone
"640b6eb01024425951abad25" deathly hallows
"640b6eb01024425951abad3d" goblet of fire
"640b6eb01024425951abad3f" half blood prince
"640b6eb01024425951abad51" chamber of secrets

//IRRELEVANT BOOKS
"640b6eb21024425951abe5ed" how to cook everything
"640b6eb21024425951abe73f" art of soviet cooking
"640b6eb31024425951ac0d2c" anime manga
"640b6eb01024425951abb2bd" gandhi autobiography
"640b6eb01024425951abb449" malcom x autobiography
"640b6eb01024425951abb7a4" soldier autobiography
"640b6eb31024425951abfc25" horrid henry
"640b6eb01024425951abad58" cat in the hat
"640b6eb31024425951ac146f" waldo*/


/*
function test() {
  const A = "Harry Potter Chamber Secrets JKRowling Hogwarts School";
  const B = "Harry Potter Deathly Hallows JKRowling Voldemort School";
  const C = "Harry Potter Chamber Secrets JKRowling Hogwarts School";
  console.log(textCosineSimilarity(A, B));
}

test();*/
