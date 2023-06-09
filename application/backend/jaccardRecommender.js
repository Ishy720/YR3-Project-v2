/*
  This file contains the implementation for the jaccard recommendation system.
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
    console.log("Jaccard Recommendation engine connected to MongoDB");
    //recommendForBook("640b6eb01024425951abb166");
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
    //removes punctuation from word and converts word to lowercase
    const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim().toLowerCase();

    if (cleanedWord !== "") {
      tokenSet.add(cleanedWord);
    }
  }

  return tokenSet;
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


//calculate Jaccard similarity coefficient between two sets (books)
//J(A, B) = |A ∩ B| / |A ∪ B|
//where A and B are sets of elements, and |A| and |B| denote the number of elements in each set
function jaccardSimilarity(set1, set2) {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

//returns recommended books for given input book id
async function recommendForBook(bookId) {

    //get the input book from the book database by its ID
    const inputBook = await Book.findById(bookId);
    console.log(`Generating recommendations for ${inputBook.title}...`);

    const genres = inputBook.genres;

    //get the bag of words representation of the input book
    const inputTokens = tokenize(inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description);

    //get books to compare against which have at least one matching genre
    const relatedBooks = await retrieveRelatedBooks(bookId, genres);
  
    //get Jaccard similarity coefficient between input book and retrieved book bag of word representations
    const results = relatedBooks.map(book => {
      const bookTokens = tokenize(book.title + ' ' + book.author + ' ' + book.description);
      const similarity = jaccardSimilarity(inputTokens, bookTokens);
      return { book, similarity };
    });
  
    //sort books by descending similarity
    results.sort((a, b) => b.similarity - a.similarity);
    return results.splice(0, 30);
    /*
    //print top 6 books
    for (let i = 0; i < 6 && i < results.length; i++) {
      const { book, similarity } = results[i];
      console.log(`${i + 1}. ${book.title} - Jaccard Similarity: (${similarity.toFixed(3)})`);
    }*/
}

/*
recommendForBook("640b6eb11024425951abbfde")
.then((result) => {
  result.forEach((book) => {
    console.log(book.book.title + "  " + book.similarity);
  });
})*/

exports.recommendForBook = recommendForBook;

//this function is used to test the time and memory performance of the recommendation system.
async function runTest() {
  //measure the initial memory usage and time
  const memoryBefore = process.memoryUsage().heapUsed
  const start = Date.now()
  recommendForBook("640b6eb11024425951abbfde")
    .then((result) => {
      const end = Date.now()
      const memoryAfter = process.memoryUsage().heapUsed
      //print the measured time taken and memory used
      console.log('Time', (end - start) / 1000, 's', '||', 'Memory used:', (memoryAfter - memoryBefore) / (1024 * 1024), 'MB');
      //print the books that were recommended
      result.forEach((book) => {
        console.log(book.book.title + "  " + book.similarity);
      });
    })
}

runTest();

//test function to compare two books specifically
async function compareBooks(bookA, bookB) {

  const inputBook = await Book.findById(bookA).exec();
  const comparisonBook = await Book.findById(bookB).exec();

  const inputTokens = tokenize(inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description);
  const comparisonTokens = tokenize(comparisonBook.title + ' ' + comparisonBook.author + ' ' + comparisonBook.description);

  const score = jaccardSimilarity(inputTokens, comparisonTokens);;

  console.log(`Jaccard similarity between ${inputBook.title} and ${comparisonBook.title}: ${score}`);
}

//compareBooks("640b6eb11024425951abbfde", "640b6eb11024425951abc9c8");


function test() {
  const A = tokenize("Harry Potter Chamber Secrets JKRowling Hogwarts School");
  const B = tokenize("Harry Potter Deathly Hallows JKRowling Voldemort School");
  const C = tokenize("Harry Potter Chamber Secrets JKRowling Hogwarts School");
  console.log(jaccardSimilarity(A, B));
}

//test();

