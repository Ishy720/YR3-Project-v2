//Imports
const app = require("./server.js");
const { hashSync, compareSync } = require("bcrypt");
const { checkUser, verifyToken } = require("./authMiddleware");
const jwt = require('jsonwebtoken');
const recommendationEngine = require('./recommendationEngine');
require("dotenv").config();

//Database asset imports
const mongoose = require("mongoose");
const User = require("./models/UserSchema.js");
const Book = require("./models/BookSchema.js");

const path = require('path');

app.get("/test", function (req, res) {
  res.status(200).json({ message: "Success!" });
});

app.get("/testMiddleware", checkUser("USER"), function (req, res) {
  res.status(200).json({ message: "Woah it worked" });
});

app.get("/logout", verifyToken(), function (req, res) {
  req.session.destroy();
  res.json({ message: "Destroyed session" });
});

app.post("/uploadUser", function (req, res) {
  console.log(req.body);
  const userData = req.body;
  res.json({ message: userData });
});

app.post("/createTestSession", function (req, res) {
  req.session.userID = "Test ID";
  res.json({ message: "Created session", session: req.session });
});

app.get("/session", (req, res) => {
  res.json({ session: req.session });
});

//users, managers and admins can all access this
app.post("/getBooksBySearchTerm", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), (req, res) => {
  const { searchTerm } = req.body;
  const bookModel = mongoose.model("Book");
  bookModel
    .find({ title: { $regex: searchTerm, $options: "i" } })
    .limit(10)
    .then((results) => {
      res.json({ books: results });
    })
    .catch((err) => {
      throw err;
    });
});


//When a user registers a new account
//anyone can call this
app.post("/registerNewUser", async function (req, res) {
  //Get user details
  const { username, password, accountType } = req.body;

  //Validate inputs!!!

  //Check if username already exists
  User.exists({ username: username }, async function (error, result) {
    if (error) throw error;

    if (!result) {
      //Encrypt password

      const encryptedPassword = hashSync(password, 10);

      const newUser = User({
        username: username,
        password: encryptedPassword,
        accountType: accountType
      });

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

      //Send back response
      res.status(200).json({ message: "Successfully registered!" });
    } else {
      //Send back response
      res.status(201).json({ message: "Username already taken!" });
    }
  });
});

app.post("/testsession", function (req, res) {
  console.log(req.session);
  res.json(req.session);
});

//anyone can call this
app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  const retrievedPassword = password;

  User.exists({ username: username }, function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Error occured trying to log in" });
    } else {
      if (result) {
        User.find({ username: username }, function (error, documents) {
          if (error) throw error;
          const [returnedDocument] = documents;
          const { _id, username, password, accountType } = returnedDocument;

          if (compareSync(retrievedPassword, password)) {

            // Generate JWT token
            const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

            req.session.authenticated = true;
            req.session.accountType = accountType;
            req.session.user = {
              id: _id,
              username: username,
              loggedIn: true,
            };

            console.log("Logged in user");

            res.status(200).json({
              message: "You have successfully logged into your account!",
              user: { username: username, id: _id, accountType: accountType },
              token: token
            });
          } else {
            console.log("Incorrect details");
            //Tell them wrong username/password (its really the password but we don't tell them)
            res.status(401).json({ message: "Incorrect username/password" });
          }
        });
      } else {
        console.log("Couldn't find the user account");
        //User doesn't exist, tell them that doesn't work
        res.status(404).json({ message: "That user does not exist" });
      }
    }
  });
});

//users, managers and admins should all access this
app.post("/getRecommendationsForOneBook", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), async (req, res) => {
  
  const { bookId } = req.body;

  const result = await recommendationEngine.recommendFromOneRandomBook(bookId);
  //console.log("Sending back recommendations");

  res.status(200).json({ books: result });

});

//admins should only access this
app.post("/getSiteAnalytics", verifyToken(),  checkUser(["ADMIN"]),async function (req, res) {
  try {
    const totalBookCount = await Book.countDocuments();
    const totalUserCount = await User.countDocuments();
    const mostCommonBook = await User.aggregate([
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
      {
        $group: {
          _id: "$bookIds",
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 1
      }
    ]);
    const genreCounts = await Book.aggregate([
      {
        $unwind: "$genres"
      },
      {
        $group: {
          _id: "$genres",
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 5
      }
    ]);


    res.status(200).json({ 
      totalBookCount: totalBookCount,
      totalUserCount: totalUserCount,
      mostCommonBook: mostCommonBook,
      genreCounts: genreCounts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


//  add book to to-read list controller
const addBookToReadList = async (req, res) => {
  const { userId, bookId } = req.params;

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res.status(404).json({ msg: `No book with  id: ${bookId} found!` });
  }

  // check  if user exists
  const checkUser = await User.findOne({ _id: userId });
  if (!checkUser) {
    return res.status(404).json({ message: "could not add book to any list" });
  }

  // check if book already exists in list
  const check = checkUser.toReadList.find((book) => book._id == bookId);

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
      $push: { toReadList: book },
      $pull: { finishedList: book, currentlyReadingList: book },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedUser);
};

//  add book to currently reading list controller
const addToCurrentlyReadingList = async (req, res) => {
  const { userId, bookId } = req.params;

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res.status(404).json({ msg: `no book with  id:${bookId} found` });
  }

  // check  if user exists
  const checkUser = await User.findOne({ _id: userId });
  if (!checkUser) {
    return res.status(404).json({ message: "could not add book to any list" });
  }

  // check if book already exists in list
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

//add book to finshed reading list controller
const addToFinishedList = async (req, res) => {
  const { userId, bookId } = req.params;

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res.status(404).json({ msg: `no book with  id:${bookId} found` });
  }

  // check  if user exists
  const checkUser = await User.findOne({ _id: userId });
  if (!checkUser) {
    return res.status(404).json({ message: "could not add book to any list" });
  }

  // check if book already exists in list
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

const getToReadList = async (req, res) => {
  const { userId } = req.params;
  const toReadList = await User.findById({ _id: userId })
    .select("toReadList -_id")
    .sort("createdAt");
  if (!toReadList) return res.status(404).json({ message: "no list found" });
  res.status(200).json(toReadList);
};

const getCurrentlyReadingList = async (req, res) => {
  const { userId } = req.params;
  const currentlyReadingList = await User.findById({ _id: userId }).select(
    "currentlyReadingList -_id"
  );
  if (!currentlyReadingList)
    return res.status(404).json({ message: "no list found" });
  res.status(200).json(currentlyReadingList);
};

const getFinishedList = async (req, res) => {
  const { userId } = req.params;
  const finishedList = await User.findById({ _id: userId }).select(
    "finishedList -_id"
  );
  if (!finishedList) return res.status(404).json({ message: "no list found" });
  res.status(200).json(finishedList);
};

const deleteBookFromList = async (req, res) => {
  const { bookId, userId } = req.params;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "No user found " });

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

  res.status(200).json(updatedUser);
};

const recommendedBooksByAuthor = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({ _id: userId });
  const joinedBooks = user.toReadList.concat(
    user.finishedList,
    user.currentlyReadingList
  );
  const authors = [];
  joinedBooks.map((book) => authors.push(book.author));

  const uniqueAuthors = [...new Set(authors)];
  const books = await Book.find({ author: { $in: uniqueAuthors } }).sort("avgRating");

  const filterBooks = books
    .filter((x) => !joinedBooks.find((y) => y.title === x.title))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 20);

  res.status(200).json({
    filterBooks,
    length: filterBooks.length,
  });
};

const recommendedBooksByGenre = async (req, res) => {

  const { userId } = req.params;

  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json({ message: "No user found" });

  const joinedBooks = user.toReadList.concat(
    user.finishedList,
    user.currentlyReadingList
  );

  if (joinedBooks.length == 0) {
    return res.status(200).json({
      message: "No recommendations yet, please add books to your list",
    });
  }

  let genre = [];
  joinedBooks.map((book) => (genre = genre.concat(book.genres)));
  const uniqueGenre = [...new Set(genre)].slice(0, 5);
  const books = await Book.find({ genres: { $all: uniqueGenre } });

  const filterBooks = books
    .filter((x) => !joinedBooks.find((y) => y.title === x.title))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 20);

  // res.status(200).json({
  //   filterBooks,
  //   length: filterBooks.length,
  // });

  res.json({ filterBooks, length: filterBooks.length });
};

// Create custom list
const createCustomList = async (req, res) => {
  const { userId } = req.params;
  const { listName } = req.body;

  if (!listName)
    return res.status(400).json({ message: "List name can not be empty" });
  var key = listName;
  var value = [];

  var placeholder = {};
  placeholder["customList." + key] = value;

  const user = await User.findOne({ _id: userId })
  if (!user) return res.status(404).json({ message: "No user found" });

  if (user.customList && user.customList[listName]) return res
    .status(403)
    .json({ message: `A list with name ${listName} exists` })

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: placeholder },
    { new: true, runValidators: true }
  );

  res.status(201).json({ message: `${listName} list created successfully` });
};

// Delete custom list
const deleteCustomList = async (req, res) => {
  const { userId } = req.params;
  const { listName } = req.body;

  if (!listName)
    return res.status(400).json({ message: "List name can not be empty" });
  const user = await User.findOne({ _id: userId });
  if (!user) return res.status(404).json({ message: "No user found" });

  var key = listName;
  var value = [];

  var placeholder = {};
  placeholder["customList." + key] = value;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $unset: placeholder },
    { new: true, runValidators: true }
  );
  res.status(201).json({ message: `${listName} list deleted successfully` });
};

// Add book to custom list
const addBookToCustomList = async (req, res) => {
  const { userId, bookId } = req.params;
  const { list } = req.query;

  if (!list)
    return res.status(400).json({ message: "list name can not be empty" });
  const { customList } = await User.findOne({ _id: userId }).select(
    "customList"
  );

  const book = await Book.findOne({ _id: bookId });

  if (!book)
    return res.status(404).json({ message: `No book with id ${bookId}found` });

  if (!customList[list])
    return res.status(404).json({ message: `No list with the name ${list}` });

  const checkiIfBookIsInList = customList[list].find(
    (book) => book._id == bookId
  );

  if (checkiIfBookIsInList)
    return res.status(200).json({ message: "Book already exist in list" });

  var key = list;
  var value = book;

  var placeholder = {};
  placeholder["customList." + key] = value;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $push: placeholder },
    { new: true, runValidators: true }
  );
  res.status(200).json({ message: `Book added to ${list} list successfully` });
};

// Remove book from custom list
const removeBookFromCustomList = async (req, res) => {
  const { userId, bookId } = req.params;
  const { list } = req.query;
  if (!list)
    return res.status(400).json({ message: "List name cannot be empty!" });

  const { customList } = await User.findOne({ _id: userId }).select("customList");

  const book = await Book.findOne({ _id: bookId });

  if (!book)
    return res.status(404).json({ message: `No book with id ${bookId} found!` });

  if (!customList[list])
    return res.status(404).json({ message: `No list with the name ${list}!` });

  const checkiIfBookIsInList = customList[list].find(
    (book) => book._id == bookId
  );

  if (!checkiIfBookIsInList)
    return res.status(400).json({ message: "Book doest not exists in list" });

  var key = list;
  var value = book;

  var placeholder = {};
  placeholder["customList." + key] = value;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $pull: placeholder },
    { new: true, runValidators: true }
  );
  res
    .status(200)
    .json({ message: `Book removed from ${list} list successfuly` });
};

const getCustomList = async (req, res) => {

  const { userId } = req.params;

  const customList = await User.findOne({ _id: userId })
    .select("customList -_id")
    .sort("createdAt");

  if (!customList) return res.status(404).json({ message: "No list found" });

  res.status(200).json(customList);

};

const editBookInDB = async (req, res) => {

  const bookId = req.params.bookId;
  const updates = req.body;

  const excludedFields = ['avgRating', 'likedPercentage', 'ratingDistribution'];
  
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


//these controllers can be accessed by users, managers and admins
app.post("/createcustomlist/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), createCustomList);
app.patch("/deletecustomlist/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), deleteCustomList);
app.get("/customlist/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), getCustomList);

app.patch("/customlist/addbook/:userId/:bookId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), addBookToCustomList);
app.patch("/customlist/removebook/:userId/:bookId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), removeBookFromCustomList);
app.get("/recommendationbyauthor/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), recommendedBooksByAuthor);
app.get("/recommendationbygenre/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), recommendedBooksByGenre);

app.patch("/toreadlist/:userId/:bookId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), addBookToReadList);
app.patch("/currentlyreadinglist/:userId/:bookId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), addToCurrentlyReadingList);
app.patch("/finishedlist/:userId/:bookId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), addToFinishedList);

app.get("/list/toread/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), getToReadList);
app.get("/list/currentlyreading/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), getCurrentlyReadingList);
app.get("/list/finished/:userId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), getFinishedList);

app.patch("/delete/:userId/:bookId", verifyToken(), checkUser(["USER", "ADMIN", "MANAGER"]), deleteBookFromList);

//only managers and admins should access this
app.patch("/editBook/:bookId", verifyToken(), checkUser(["ADMIN", "MANAGER"]), editBookInDB);

//for heroku
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});