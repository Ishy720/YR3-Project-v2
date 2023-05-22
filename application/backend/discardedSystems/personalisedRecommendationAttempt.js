/*
  This file was an attempt at using brain.js to predict recommendations based on user's ratings on book genres for initial testing.
  brain.js documentation I referred to for making this file: https://github.com/BrainJS/brain.js#brainjs

  The idea behind this system was to train a neural network to predict what users would like based off of their rating information
  on books, with information about the books such as title and genre as a starting basis. How it worked was it would associate word frequency 
  from these fields with a given numerical user rating between 0-1 as a weighting. The ANN would look at other books and compare word frequencies 
  and predict their weightings to overall determine how the user would rate those books too. Books that had higher predicted scores would be 
  deemed as higher interest to the user.
  
  However, the runtime of this file is extremely slow and was extremely inefficient to test, let alone use as a solution for recommendations.
  Because the system was so slow, I implemented a caching system but this was pointless as the system was too slow to begin with and 
  caching previous results would be useless if the user was to get recommendations on a new set of books.
  This system has been abandoned and I have kept this here as a means for a prototype start for personalised recommendations.
*/

//Imports
const brain = require("brain.js");
const cache = require('memory-cache');
const Book = require("../models/BookSchema.js");
const mongoose = require("mongoose");
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

//instantiate the neural network
const net = new brain.NeuralNetwork();

//track unique genres
let uniqueGenres = [];

//create neural network input
const createInput = (genres, rating) => {
    const input = {};
    genres.forEach(genre => {
        input[genre] = 1;
    });
    input.rating = rating;
    return input;
};

//this function is an attempt to recommend books by genre ratings. It takes in the users books and a cache key. If there are previously
//cached results, those are returned instead to improve runtime performance. 
const recommendBooks = async (userBooks, cacheKey) => {
    const cachedRecommendations = cache.get(cacheKey);

    //check for cached results, and return if so
    if (cachedRecommendations) {
      console.log("Cache found");
      return cachedRecommendations;
    }
  
    //get all books from MongoDB database
    return Book.find({})
      .then(books => {
        console.log("Retrieved books");

        //get the unique genres in the database
        uniqueGenres = Array.from(new Set(books.reduce((genres, book) => [...genres, ...book.genres], [])));
        console.log("Unique Genres: " + uniqueGenres);
        
        //remove all the books that are already in the user's books
        const filteredBooks = books.filter(book => !userBooks.some(ub => ub.title === book.title));

        //make training object, input is genres and rating for those genres (0 if no rating is present), output is the corresponding
        //book title
        const bookData = filteredBooks.map(book => ({
          input: createInput(book.genres, book.rating || 0),
          output: { [book.title]: 1 }
        }));

        //train the neural network
        console.log("Training network");
        net.train(bookData);
        console.log("Training completed");
  
        //array to hold recommendations
        const recommendations = [];

        //for each genre set the rating by the user book ratings
        uniqueGenres.forEach(genre => {
          let rating = 0;
          userBooks.forEach(book => {
            if (book.genres.includes(genre)) {
              rating += book.rating;
            }
          });

          const input = createInput([genre], rating / userBooks.length || 0); //avg rating

          console.log("Running network");
          const result = net.run(input);
          console.log("Finished running user books against network");

          //for each object in the results returned by the network, check if the results contain books in the user's books and ignore
          //if found, otherwise push those results into recommendation array.
          Object.keys(result).forEach(title => {
            if (!userBooks.some(book => book.title === title) && !recommendations.includes(title)) {
              recommendations.push(title);
              console.log("Recommending: " + title);
            }
          });
        });

        //make cache for results
        cache.put(cacheKey, recommendations, 60000);

        console.log("Full recommendations:" + recommendations);

        return recommendations;
      })
      .catch(error => console.error(error));
};
  
//sample of user books to test the system with
const userBooks = [
    { title: "Harry Potter and the Order of the Phoenix", genres: ['Science Fiction Fantasy', 'Classics', 'Magic', 'Childrens', 'Fantasy', 'Young Adult', 'Fiction', 'Adventure'], rating: 5 },
    { title: "The Chronicles of Narnia", genres: ['Adventure', 'Science Fiction Fantasy', 'Childrens', 'Classics', 'Fiction', 'Young Adult', 'Fantasy'], rating: 4 }
];

//test cache key
const cacheKey = "user-books";

//recommend books with the test input books and test cache key
recommendBooks(userBooks, cacheKey)
  .then(recommendations => {
    console.log(recommendations);
  })
  .catch(error => console.error(error));