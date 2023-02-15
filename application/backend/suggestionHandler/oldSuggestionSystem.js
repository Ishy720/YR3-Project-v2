//OLD, run time is awfully slow and will never be used in a real environment.

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

const net = new brain.NeuralNetwork();
let uniqueGenres = [];

const createInput = (genres, rating) => {
    const input = {};
    genres.forEach(genre => {
        input[genre] = 1;
    });
    input.rating = rating;
    return input;
};

const recommendBooks = async (userBooks, cacheKey) => {
    const cachedRecommendations = cache.get(cacheKey);

    if (cachedRecommendations) {
      console.log("Cache found");
      return cachedRecommendations;
    }
  
    return Book.find({})
      .then(books => {
        console.log("Retrieved books");

        if(uniqueGenres.length === 0) {
          uniqueGenres = Array.from(new Set(books.reduce((genres, book) => [...genres, ...book.genres], [])));
          console.log("Unique Genres: " + uniqueGenres);
        }

        const filteredBooks = books.filter(book => !userBooks.some(ub => ub.title === book.title));

        const bookData = filteredBooks.map(book => ({
          input: createInput(book.genres, book.rating || 0),
          output: { [book.title]: 1 }
        }));

        console.log("Training the net");
        net.train(bookData);
        console.log("Training completed");
  
        const recommendations = [];
        uniqueGenres.forEach(genre => {
          let rating = 0;
          userBooks.forEach(book => {
            if (book.genres.includes(genre)) {
              rating += book.rating;
            }
          });
          const input = createInput([genre], rating / userBooks.length || 0);
          console.log("Running network");
          const result = net.run(input);
          console.log("Finished running user books against network");
          Object.keys(result).forEach(title => {
            if (!userBooks.some(book => book.title === title) && !recommendations.includes(title)) {
              recommendations.push(title);
              console.log("Recommending: " + title);
            }
          });
        });
        cache.put(cacheKey, recommendations, 60000);
        console.log("Full recommendations:" + recommendations);
        return recommendations;
      })
      .catch(error => console.error(error));
};
  
const userBooks = [
    { title: 'Harry Potter and the Order of the Phoenix', genres: ['Science Fiction Fantasy', 'Classics', 'Magic', 'Childrens', 'Fantasy', 'Young Adult', 'Fiction', 'Adventure'], rating: 5 },
    { title: 'The Chronicles of Narnia', genres: ['Adventure', 'Science Fiction Fantasy', 'Childrens', 'Classics', 'Fiction', 'Young Adult', 'Fantasy'], rating: 4 }
];

const cacheKey = 'user-books';

recommendBooks(userBooks, cacheKey)
  .then(recommendations => {
    console.log(recommendations);
  })
  .catch(error => console.error(error));