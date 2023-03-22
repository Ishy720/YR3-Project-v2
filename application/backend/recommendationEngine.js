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
    const tokenSet = new Set();

    for (const word of relevantWordsArray) {
      const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim();
  
      if (cleanedWord !== "") {
        tokenSet.add(cleanedWord);
      }
    }
  
    return Array.from(tokenSet);
}

//takes an array of genres and retrieves randomized sample of books which regex match the input genres array
async function retrieveRelatedBooks(bookId, genres) {

  /*
  Retrieves all books for tfidf to scan through, very time costly. Also not accurate; my engine isn't checking the genre similarity
  so this will result in anomalous results. e.g harry potter and order of phoenix, 30th recommendation returned is about
  "tasteful nudes and other misguided attempts at personal growth and validation". This is not a suitable recommendation.
  */
  //const books = await Book.find();

  //Retrieves smaller sample which matches by genre. Much faster execution and better related corpus for tf-idf
  
  const books = await Book.aggregate([
    { $match: { genres: { $in: genres } } },
    //{ $match: { _id: { $ne: mongoose.Types.ObjectId(bookId) } } },
    { $sample: { size: 20000 } },
    { $project: { _id: 1, title: 1, author: 1, releaseDate: 1, description: 1, imgurl: 1, genres: 1, avgRating: 1, likedPercentage: 1, ratingDistribution: 1 } }
  ]).exec();
  //const books = await Book.find({ genres: /Comic Book/i });
  
  return books;
}

//takes array of books and returns tokenized descriptions
function getTokenizedFeatures(books) {
  return books.map(book => tokenize(book.title + " " + book.description));
  //return books.map(book => tokenize(book.description));
}

//returns a set of recommended books
async function recommendFromOneRandomBook(bookId) {

  const inputBook = await Book.findOne({ _id: bookId });

  console.log("Generating recommendations for " + inputBook.title);
  const inputBookGenres = inputBook.genres;

  const databaseSample = await retrieveRelatedBooks(bookId, inputBookGenres);
  const tokenizedFeatures = getTokenizedFeatures(databaseSample);

  //instantiate tfidf
  const tfidf = new natural.TfIdf();

  //add the tokenized descriptions to the tfidf instance
  for (const tokens of tokenizedFeatures) {
    tfidf.addDocument(tokens);
  }

  const recommendedBooks = [];

  //get the tf-idf score for the input book by summing TF-IDF score for each token feature
  tfidf.tfidfs(tokenize(inputBook.title + " " + inputBook.description), (i, measure) => {
    recommendedBooks.push({
      book: databaseSample[i],
      score: measure
    });
  });

  //sort the recommended books by descending score
  recommendedBooks.sort((a, b) => b.score - a.score);

  //return the top 30 books
  const topBooks = recommendedBooks.slice(0, 30);
  return topBooks;
}


//pass a book ID into the function. The function will recommend books related to it.
recommendFromOneRandomBook("640b6eb11024425951abbfde")
  .then(response => {
    
    
    //for(data in response) {
    //  console.log(`Book: ${response[data].book.title} - Similarity score: ${response[data].score}`);
    //}
    

    // Find minimum and maximum scores
    const minScore = response[response.length - 1].score;
    const maxScore = response[0].score;
    const scoreRange = maxScore - minScore;
    
    for(data in response) {
      // Normalize scores between 1-100
      const normalizedScore = (response[data].score - minScore) / scoreRange * 99 + 1;
      
      console.log(`${data}: ${response[data].book.title} - Similarity score: ${normalizedScore.toFixed(2)}`);
    }
        
  })
  .catch(error => console.error(error));


exports.recommendFromOneRandomBook = recommendFromOneRandomBook;

//"640b6eb01024425951abad25" harry potter deathly hallows
//"640b6eb31024425951ac0c6f" xmen book


//--------------------------------------------------------------------------------

/*
async function recommendFromSimilarUsers(userId) {

  //retrieve the user's to-read list, currently-reading list, finished-reading list

  //fetch sample of similar users by comparing their reading lists. logic for this to be undecided

  //use tf-idf to rate those user's books against the input user's books

  //APPROACH 1
  //out of the top few similar users, retrieve the books they have that the input user does not have and return those

  //APPROACH 2
  //out of all the books from the similar users, return the books with highest compatability scores which the input user doesn't have

}
*/



/*
//pass a user ID into the function. The function will recommend books by checking similar user tastes and recommend books they have.
recommendFromSimilarUsers("63ea439a88f303678100b11f")
  .then(response => {
    console.log(response)
  })
  .catch(error => console.error(error));
  */
