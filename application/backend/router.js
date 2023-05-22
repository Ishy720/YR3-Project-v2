/*
  This file is the router for the application's server. It contains endpoints for the client to communicate with described further.
*/

//Imports
const app = require("./server.js");
const { hashSync, compareSync } = require("bcrypt");
const { checkUser, verifyToken, limitCallRate } = require("./authMiddleware");
const jwt = require('jsonwebtoken');
const recommendationEngine = require('./jaccardRecommender.js');
const path = require('path');
require("dotenv").config();

//Database asset imports
const mongoose = require("mongoose");
const User = require("./models/UserSchema.js");
const Book = require("./models/BookSchema.js");


//ENDPOINTS

//this endpoint is responsible for logging out the user by terminating their express session in the server.
app.get("/logout", limitCallRate, verifyToken(), function (req, res) {
  req.session.destroy();
  res.status(200).json({ message: "Destroyed session" });
});


//this endpoint is responsible for returning book results given a search term.
app.get("/books/search/:searchTerm", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), (req, res) => {
  //get the search term from the request parameter
  const { searchTerm } = req.params;

  //query the search term using regex to get partial matches from the book table from database, limited to 10 results.
  const bookModel = mongoose.model("Book");
  bookModel
    .find({ title: { $regex: searchTerm, $options: "i" } })
    .limit(10)
    .then((results) => {
      //return the books as JSON
      res.json({ books: results });
    })
    .catch((err) => {
      throw err;
    });
});


//this endpoint is responsible for letting users register their accounts into the database.
app.post("/register", limitCallRate, async function (req, res) {

  //get user details from the request body
  const { username, password } = req.body;

  //check if username already exists in the database
  User.exists({ username: username }, async function (error, result) {
    if (error) throw error;

    //the account username doesn't exist, so the account can be created
    if (!result) {

      //hash and salt password
      const encryptedPassword = hashSync(password, 10);

      //create the user ccount
      const newUser = User({
        username: username,
        password: encryptedPassword,
        accountType: "USER"
      });

      //save the user account to the database
      try {
        await newUser
          .save()
          .then(function (data) {
            console.log(`Inserted\n${data}\ninto LibraryDB.users`);
          })
          .catch(console.error);
      } catch (error) {
        console.log(`Could not add entry to database! Error: ${error}`);
      }

      //send back success response
      res.status(200).json({ message: "Successfully registered!" });
    } else {
      //send back error response
      res.status(400).json({ message: "Username already taken!" });
    }
  });
});

//this endpoint is responsible for logging in users by checking their account details and creating the express session in the server.
app.post("/login", limitCallRate, async function (req, res) {

  //get the user details from the request body
  const { username, password } = req.body;

  //hold password in separate variable for comparison
  const retrievedPassword = password;

  //check if username exists in the database
  User.exists({ username: username }, function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Error occured trying to log in" });
    } else {
      //if the username does exist
      if (result) {
        //get the user details from the database
        User.find({ username: username }, function (error, documents) {
          if (error) throw error;
          const [returnedDocument] = documents;

          //pipeline the user data into variables
          const { _id, username, password, accountType } = returnedDocument;

          //if the request password matches the account password in the database
          if (compareSync(retrievedPassword, password)) {

            //generate JWT token and uniquely sign it on the user's ID and secret variable
            const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

            //set up express session
            req.session.authenticated = true;
            req.session.accountType = accountType;
            req.session.user = {
              id: _id,
              username: username,
              loggedIn: true,
            };

            //return success message and user data + JWT authentication token
            res.status(200).json({
              message: "You have successfully logged into your account!",
              user: { username: username, id: _id, accountType: accountType },
              token: token
            });
          } else {
            //incorrect password, return vague error message to mitigate account enumeration
            res.status(401).json({ message: "Incorrect details" });
          }
        });
      } 
      else {
        //account doesn't exist, return vague error message to mitigate account enumeration
        res.status(401).json({ message: "Incorrect details" });
      }
    }
  });
});

//this endpoint is responsible for returning book recommendations given an input book.
app.get("/books/recommendations/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), async (req, res) => {
  
  //get the given book id from the request parrameters
  const { bookId } = req.params;

  //get the recommendation results
  const result = await recommendationEngine.recommendForBook(bookId);

  //return the recommendations as JSON
  res.status(200).json({ books: result });

});

//this endpoint is responsible for getting application analytics.
app.get("/analytics", limitCallRate, verifyToken(),  checkUser(["MANAGER"]), async function (req, res) {
  try {
    //count the number of books the application has to offer
    const totalBookCount = await Book.countDocuments();
    //count the users registered with the application
    const totalUserCount = await User.countDocuments();

    //count the books users have to find the most common one using Mongoose aggregate functions
    const mostCommonBook = await User.aggregate([
      //concatenates all core reading list arrays
      {
        $project: {
          bookIds: {
            $concatArrays: [
              { $ifNull: ["$finishedList", []] },
              { $ifNull: ["$currentlyReadingList", []] },
              { $ifNull: ["$toReadList", []] }
            ]
          }
        }
      },
      {
        $unwind: "$bookIds"
      },
      //count the number of books by their IDs
      {
        $group: {
          _id: "$bookIds",
          count: { $sum: 1 }
        }
      },
      //sort the grouped results by descending count
      {
        $sort: {
          count: -1
        }
      },
      //return the top one (the most common book)
      {
        $limit: 1
      }
    ]);

    //count the number of users who have registered over the past 6 months if any, using Mongoose aggregate functions again
    const prevSixMonths = new Date();
    prevSixMonths.setUTCMonth(prevSixMonths.getUTCMonth() - 6);
    const userCountsByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: prevSixMonths }
        }
      },
      {
        $project: {
          month: { $month: "$createdAt" }
        }
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 }
        }
      }
    ]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const registrations = {};

    //map month names to the counts
    for (const userCount of userCountsByMonth) {
      const monthName = monthNames[userCount._id - 1];
      registrations[monthName] = userCount.count;
    }

    //return results as JSON
    res.status(200).json({ 
      totalBookCount: totalBookCount,
      totalUserCount: totalUserCount,
      mostCommonBook: mostCommonBook,
      registrations: registrations
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


//CONTROLLERS

//add a book to a user's to-read list
const addBookToReadList = async (req, res) => {

  //get ids
  const { userId, bookId } = req.params;

  //try and find the book
  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res.status(404).json({ msg: `No book with  id: ${bookId} found!` });
  }

  //check if user exists
  const checkUser = await User.findOne({ _id: userId });
  if (!checkUser) {
    return res.status(404).json({ message: "could not add book to any list" });
  }

  //check if the book already exists in list
  const check = checkUser.toReadList.find((book) => book._id == bookId);

  if (check) {
    return res.status(400).json({
      message: `${book.title} by ${book.author} already exists in your list`,
    });
  }

  //push the book into the user's reading list and pull from other lists so they can't co-exist in core reading lists
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $push: { toReadList: book },
      $pull: { finishedList: book, currentlyReadingList: book },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedUser);
};

//add a book to a user's currently-reading list
const addToCurrentlyReadingList = async (req, res) => {
  const { userId, bookId } = req.params;

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res.status(404).json({ msg: `no book with  id:${bookId} found` });
  }

  //check if user exists
  const checkUser = await User.findOne({ _id: userId });
  if (!checkUser) {
    return res.status(404).json({ message: "could not add book to any list" });
  }

  //check if book already exists in list
  const check = checkUser.currentlyReadingList.find(
    (book) => book._id == bookId
  );

  if (check) {
    return res.status(400).json({
      message: `${book.title} by ${book.author} already exists in your list`,
    });
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $push: { currentlyReadingList: book },
      $pull: { finishedList: book, toReadList: book },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedUser);
};

//add a book to a user's finished-reading list
const addToFinishedList = async (req, res) => {
  const { userId, bookId } = req.params;

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res.status(404).json({ msg: `no book with  id:${bookId} found` });
  }

  //check if user exists
  const checkUser = await User.findOne({ _id: userId });
  if (!checkUser) {
    return res.status(404).json({ message: "could not add book to any list" });
  }

  //check if book already exists in list
  const check = checkUser.finishedList.find((book) => book._id == bookId);

  if (check) {
    return res.status(400).json({
      message: `${book.title} by ${book.author} already exists in your list`,
    });
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $push: { finishedList: book },
      $pull: { currentlyReadingList: book, toReadList: book },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedUser);
};

//return a user's to-read list
const getToReadList = async (req, res) => {
  const { userId } = req.params;
  const toReadList = await User.findById({ _id: userId })
    .select("toReadList -_id")
    .sort("createdAt");
  if (!toReadList) return res.status(404).json({ message: "no list found" });
  res.status(200).json(toReadList);
};

//return a user's currently-reading list
const getCurrentlyReadingList = async (req, res) => {
  const { userId } = req.params;
  const currentlyReadingList = await User.findById({ _id: userId }).select(
    "currentlyReadingList -_id"
  );
  if (!currentlyReadingList)
    return res.status(404).json({ message: "no list found" });
  res.status(200).json(currentlyReadingList);
};

//return a user's finished-reading list
const getFinishedList = async (req, res) => {
  const { userId } = req.params;
  const finishedList = await User.findById({ _id: userId }).select(
    "finishedList -_id"
  );
  if (!finishedList) return res.status(404).json({ message: "no list found" });
  res.status(200).json(finishedList);
};

//removes a specific book from a user's core reading lists
const deleteBookFromList = async (req, res) => {

  //get the book id and user id to remove the book from the user's lists
  const { bookId, userId } = req.params;

  //try find the user
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "No user found" });

  //try and find the book id in the users's core reading lists
  let book;
  book = user.currentlyReadingList.find((item) => item._id == bookId);

  if (!book) {
    book = user.toReadList.find((item) => item._id == bookId);
  }
  if (!book) {
    book = user.finishedList.find((item) => item._id == bookId);
  }
  if (!book) {
    return res.status(404).json({ message: "No book found" });
  }

  //pull the found book id from the user's core reading lists
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    {
      $pull: {
        currentlyReadingList: book,
        toReadList: book,
        finishedList: book,
      },
    },
    { new: true, runValidators: true }
  );

  //return the updated user data so the client can render the reading lists again with the update shown
  res.status(200).json(updatedUser);
};

//return a user's related books by author 
const relatedBooksByAuthor = async (req, res) => {

  //get the user id from request parameters
  const { userId } = req.params;

  //get the user
  const user = await User.findOne({ _id: userId });

  //retrieve the user's books from their core reading lists
  const joinedBooks = user.toReadList.concat(
    user.finishedList,
    user.currentlyReadingList
  );

  //get all unique authors from the retrieved books
  const authors = [];
  joinedBooks.map((book) => authors.push(book.author));
  const uniqueAuthors = [...new Set(authors)];

  //retrieve all books produced by the authors sorted by their goodreads rating for better user interest
  const books = await Book.find({ author: { $in: uniqueAuthors } }).sort("avgRating");

  //return the top 20 books
  const filterBooks = books
    .filter((x) => !joinedBooks.find((y) => y.title === x.title))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 20);

  //return book results as JSON
  res.status(200).json({
    filterBooks,
    length: filterBooks.length,
  });
};

//return a user's related books by author 
const relatedBooksByGenre = async (req, res) => {

  //get the user id from request parameters
  const { userId } = req.params;

  //get the user
  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json({ message: "No user found" });

  //get the user's books from their core lists
  const joinedBooks = user.toReadList.concat(
    user.finishedList,
    user.currentlyReadingList
  );

  if (joinedBooks.length == 0) {
    return res.status(200).json({
      message: "No related books to find yet, please add books to your reading lists!",
    });
  }

  //get the unique book genres
  let genre = [];
  joinedBooks.map((book) => (genre = genre.concat(book.genres)));

  //get the first 5 found (trying more makes the code run even slower, with more time I would've implemented a more efficient system)
  const uniqueGenre = [...new Set(genre)].slice(0, 5);

  const books = await Book.find({ genres: { $all: uniqueGenre } });

  const filterBooks = books
    .filter((x) => !joinedBooks.find((y) => y.title === x.title))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 20);

  //return books as JSON
  res.json({ filterBooks, length: filterBooks.length });
};

//creates a given custom reading list for a given user
const createCustomList = async (req, res) => {

  //get the user id from the request parameters
  const { userId } = req.params;

  //get the specified list name from the request body
  const { listName } = req.body;

  if (!listName)
    return res.status(400).json({ message: "List name can not be empty" });
  var key = listName;
  var value = [];

  //declare placeholder array to hold the user's array of custom lists in
  var placeholder = {};
  placeholder["customList." + key] = value;

  //get the user
  const user = await User.findOne({ _id: userId })
  if (!user) return res.status(404).json({ message: "No user found" });

  //check if the custom list name already exists
  if (user.customList && user.customList[listName]) return res
    .status(403)
    .json({ message: `A list with name ${listName} exists` })

  //update the user's array of custom lists to add the new specified custom list
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: placeholder },
    { new: true, runValidators: true }
  );

  //return success message of custom list creation
  res.status(201).json({ message: `${listName} list created successfully` });
};

//removes a given custom reading list from a given user
const deleteCustomList = async (req, res) => {
  
  //get the user id from the request parameters
  const { userId } = req.params;
  //get the list name from the request body
  const { listName } = req.body;

  if (!listName)
    return res.status(400).json({ message: "List name can not be empty" });

  //get the user
  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json({ message: "No user found" });
  var key = listName;
  var value = [];

  //declare placeholder array to hold the user's array of custom lists in
  var placeholder = {};
  placeholder["customList." + key] = value;

  //update the user's array of custom lists to remove the specified custom list
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $unset: placeholder },
    { new: true, runValidators: true }
  );
  res.status(201).json({ message: `${listName} list deleted successfully` });
};

//add a given book to custom reading list for a given user
const addBookToCustomList = async (req, res) => {

  //get the user id and book id from the request parameters
  const { userId, bookId } = req.params;

  //get the list name to add the book to from the request query
  const { list } = req.query;

  if (!list)
    return res.status(400).json({ message: "List name can not be empty" });

  //get the user's custom lists
  const { customList } = await User.findOne({ _id: userId }).select(
    "customList"
  );

  //get the book from the database by it's id
  const book = await Book.findOne({ _id: bookId });

  //check if the book doesn't exists
  if (!book)
    return res.status(404).json({ message: `No book with id ${bookId}found` });
  
  //check if the custom list to add the book to doesn't exist
  if (!customList[list])
    return res.status(404).json({ message: `No list with the name ${list}` });

  //check if the book is already in the custom list by querying with the given book id
  const checkIfBookIsInList = customList[list].find(
    (book) => book._id == bookId
  );

  if (checkIfBookIsInList)
    return res.status(200).json({ message: "Book already exist in list" });

  //insert the book into the custom list as a key-value pair
  var key = list;
  var value = book;
  var placeholder = {};
  placeholder["customList." + key] = value;

  //update the user's array of custom lists with the new placeholder custom list we added the book to
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $push: placeholder },
    { new: true, runValidators: true }
  );

  //return success JSON message
  res.status(200).json({ message: `Book added to ${list} list successfully` });
};

//remove a given book book from a given custom list from a user
const removeBookFromCustomList = async (req, res) => {

  //get the user id and book id from the request parameters
  const { userId, bookId } = req.params;

  //get the list name from the request query
  const { list } = req.query;
  if (!list)
    return res.status(400).json({ message: "List name cannot be empty!" });

  //get the user's custom lists
  const { customList } = await User.findOne({ _id: userId }).select("customList");

  //get the book by its ID
  const book = await Book.findOne({ _id: bookId });

  if (!book)
    return res.status(404).json({ message: `No book with id ${bookId} found!` });

  if (!customList[list])
    return res.status(404).json({ message: `No list with the name ${list}!` });

  const checkIfBookIsInList = customList[list].find(
    (book) => book._id == bookId
  );

  if (!checkIfBookIsInList)
    return res.status(400).json({ message: "Book doest not exists in list" });

  //remove the book from the specified custom list using key-value pairing
  var key = list;
  var value = book;

  var placeholder = {};
  placeholder["customList." + key] = value;

  //update the user's custom list array
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $pull: placeholder },
    { new: true, runValidators: true }
  );
  //send back success message in JSON
  res.status(200).json({ message: `Book removed from ${list} list successfully` });
};

//returns all custom lists from a given user
const getCustomList = async (req, res) => {

  //get the user id from the request parameters
  const { userId } = req.params;

  //get the user's custom lists
  const customList = await User.findOne({ _id: userId })
    .select("customList -_id")
    .sort("createdAt");

  if (!customList) return res.status(404).json({ message: "No list found" });

  //return the custom lists as JSON
  res.status(200).json(customList);

};

//edits a specified book in the book database
const editBookInDB = async (req, res) => {

  //get the book id from the request parameter
  const bookId = req.params.bookId;
  //get the book field updates from the request body
  const updates = req.body;

  //these fields aren't shown in the application (except avgRating for the relatedBooksByGenre() endpoint), ignore.
  const excludedFields = ['avgRating', 'likedPercentage', 'ratingDistribution'];
  
  //update the book in the database
  try {
    const updatedBook = await Book.findByIdAndUpdate(bookId, updates, { new: true }).select(`-_id -${excludedFields.join(' -')}`);
  
    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
  
    res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
  
};


//these controller endpoints can be accessed by users and managers
app.post("/createcustomlist/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), createCustomList);
app.patch("/deletecustomlist/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), deleteCustomList);
app.get("/customlist/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), getCustomList);

app.patch("/customlist/addbook/:userId/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), addBookToCustomList);
app.patch("/customlist/removebook/:userId/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), removeBookFromCustomList);
app.get("/relatedbyauthor/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), relatedBooksByAuthor);
app.get("/relatedbygenre/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), relatedBooksByGenre);

app.patch("/toreadlist/:userId/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), addBookToReadList);
app.patch("/currentlyreadinglist/:userId/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), addToCurrentlyReadingList);
app.patch("/finishedlist/:userId/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), addToFinishedList);

app.get("/list/toread/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), getToReadList);
app.get("/list/currentlyreading/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), getCurrentlyReadingList);
app.get("/list/finished/:userId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), getFinishedList);

app.patch("/delete/:userId/:bookId", limitCallRate, verifyToken(), checkUser(["USER", "MANAGER"]), deleteBookFromList);

//only managers can access this
app.patch("/editBook/:bookId", limitCallRate, verifyToken(), checkUser(["MANAGER"]), editBookInDB);

//for heroku deployment: as the react application is based on one HTML web page, all routing should only redirect to the HTML web page.
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});