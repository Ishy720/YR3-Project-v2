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
    //retrieveRelatedBooks("640b6eb11024425951abbfde");
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

//calculate Jaccard similarity coefficient between two sets (books)
//J(A, B) = |A ∩ B| / |A ∪ B|
//where A and B are sets of elements, and |A| and |B| denote the number of elements in each set

function jaccardSimilarity(set1, set2) {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function test() {
  const A = tokenize("Harry Potter Chamber Secrets JKRowling Hogwarts School");
  const B = tokenize("Harry Potter Deathly Hallows JKRowling Voldemort School");
  const C = tokenize("Harry Potter Chamber Secrets JKRowling Hogwarts School");
  console.log(jaccardSimilarity(A, B));
}

test();

//takes an array of genres and retrieves randomized sample of books which regex match the input genres array
async function retrieveRelatedBooks(bookId) {

    const inputBook = await Book.findById(bookId).exec();
    const genres = inputBook.genres;
    const inputTokens = tokenize(inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description);

    //const relatedBooks = await Book.find({});
    
    //get related books in terms of genre
    const relatedBooks = await Book.aggregate([
      { $match: { genres: { $in: genres } } },
      { $project: { _id: 1, title: 1, author: 1, releaseDate: 1, description: 1, imgurl: 1, genres: 1, avgRating: 1, likedPercentage: 1, ratingDistribution: 1 } }
    ]).exec();
  
    //get Jaccard similarity coefficient between input book and retrieved books
    const results = relatedBooks.map(book => {
      const bookTokens = tokenize(book.title + ' ' + book.author + ' ' + book.description);
      const similarity = jaccardSimilarity(inputTokens, bookTokens);
      return { book, similarity };
    });
  
    //sort books by descending similarity
    results.sort((a, b) => b.similarity - a.similarity);
  
    //print top 30 books
    for (let i = 0; i < 30 && i < results.length; i++) {
      const { book, similarity } = results[i];
      console.log(`${i}. ${book.title} - Jaccard Similarity: (${similarity.toFixed(3)})`);
    }
}

async function compareBooks(bookA, bookB) {

  const inputBook = await Book.findById(bookA).exec();
  const comparisonBook = await Book.findById(bookB).exec();

  const inputTokens = tokenize(inputBook.title + ' ' + inputBook.author + ' ' + inputBook.description);
  const comparisonTokens = tokenize(comparisonBook.title + ' ' + comparisonBook.author + ' ' + comparisonBook.description);

  const score = jaccardSimilarity(inputTokens, comparisonTokens);;

  console.log(`Jaccard similarity between ${inputBook.title} and ${comparisonBook.title}: ${score}`);
}

//compareBooks("640b6eb11024425951abbfde", "640b6eb11024425951abc9c8");


