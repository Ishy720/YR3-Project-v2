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
    { $sample: { size: 20000 } },
    { $project: { _id: 1, title: 1, description: 1 } }
  ]).exec();

  return books;
}

function getTokenizedDescriptions(books) {
  return books.map(book => tokenize(book.description));
}

async function recommendFromOneRandomBook(userId) {

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

  //instantiate tfidf
  const tfidf = new natural.TfIdf();

  //add the tokenized descriptions to the tfidf instance
  for (const tokens of tokenizedDescriptions) {
    tfidf.addDocument(tokens);
  }

  const recommendedBooks = [];

  //const inputString = chosenRandomBook.title + " " + chosenRandomBook.description;
  //const inputTokens = tokenize(inputString);

  //get the recommended books for title, also get recommended books for book description, tokenize genres and 
  //append the end results in a set
  //to get the ultimate recommendations you big brain sexy motherfucker.
  //also try lemotisation instead of stopwords because key words are being removed in title.

  //get the tf-idf score for the user's random book
  tfidf.tfidfs(tokenize(chosenRandomBook.title + " " + chosenRandomBook.description), (i, measure) => {
    recommendedBooks.push({
      book: databaseSample[i],
      score: measure
    });
  });

  //sort the recommended books by descending score
  recommendedBooks.sort((a, b) => b.score - a.score);
  const topBooks = recommendedBooks.slice(0, 30);
  return topBooks;
}


  
//pass a user ID in to the function. The function will pick a random book they've finished and recommend books related to it.
recommendFromOneRandomBook("63ea439a88f303678100b11f")
  .then(response => {
    for(data in response) {
      console.log(response[data].book.title);
    }
  })
  .catch(error => console.error(error));


  /*
let title = "Harry Potter and the Order of the Phoenix";
let description = "Harry Potter goes to Hogwarts to learn spells. However, things change when his archnemisis Lord Voldermort comes."

let concatResult = title + " " + description;
const tokenResult = tokenize(concatResult);
//const relevantWordsArray = removeStopwords(tokenResult, eng);
console.log(tokenResult)
*/