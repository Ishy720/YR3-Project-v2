//Imports
const app = require("./server.js");
const {hashSync, compareSync} = require("bcrypt");
const {checkUser, checkSession} = require("./authMiddleware");

//Database asset imports
const mongoose = require("mongoose");
const User = require("./models/UserSchema.js");
const Book = require("./models/BookSchema.js");

const path = require('path');

app.get("/test", function (req, res) {
  res.status(200).json({ message: "Success!" });
});

app.get("/testMiddleware", checkUser("USER"), function(req, res) {
  res.status(200).json({message: "Woah it worked"});
});

app.get("/logout", function (req, res) {
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

app.post("/getBooksBySearchTerm", (req, res) => {
  console.log(req.body);
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
app.post("/registerNewUser", async function (req, res) {
  //Get user details
  const { username, forename, surname, email, password, marketingAgreed, accountType } = req.body;

  //Validate inputs!!!

  //Check if username already exists
  User.exists({ username: username }, async function (error, result) {
    if (error) throw error;

    if (!result) {
      //Encrypt password

      const encryptedPassword = hashSync(password, 10);

      const newUser = User({
        username: username,
        forename: forename,
        surname: surname,
        email: email,
        password: encryptedPassword,
        marketingAgreed: marketingAgreed,
        accountType: accountType,
        banned: false,
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
      res.status(201).json({ message: "Nice one mate" });
    } else {
      //Send back response
      res.json({ message: "User already exists!" });
    }
  });
});

app.post("/testsession", function (req, res) {
  console.log(req.session);
  res.json(req.session);
});

app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  const retrievedPassword = password;

  User.exists({ username: username }, function (err, result) {
    if (err) {
      console.log(err);
      res.json({ message: "Error occured trying to log in" });
    } else {
      if (result) {
        User.find({ username: username }, function (error, documents) {
          if (error) throw error;
          const [returnedDocument] = documents;
          const { _id, username, password, accountType } = returnedDocument;

          if (compareSync(retrievedPassword, password)) {
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
              user: { username: username, id: _id, accountType: accountType},
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


//  add book to to-read list controller
const addBookToReadList = async (req, res) => {
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
  if (!user) return res.status(404).json({ message: "no user found " });

  let book;

  book = user.currentlyReadingList.find((item) => item._id == bookId);
  if (!book) {
    book = user.toReadList.find((item) => item._id == bookId);
  }

  if (!book) {
    book = user.finishedList.find((item) => item._id == bookId);
  }

  if (!book) {
    return res.status(404).json({ message: "no book found" });
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


const recommendedBooks = async (req, res) => {

  const { userId } = req.params

  const user = await User.findOne({ _id: userId })
  const joinedBooks = user.toReadList.concat(user.finishedList, user.currentlyReadingList)
  console.log(user.toReadList);
  const authors = []
  joinedBooks.map((book) => authors.push(book.author.split(",")[0]))

  const uniqueAuthors = [...new Set(authors)]
  const books = await Book.find({ author: { $in: uniqueAuthors } }).select("author title").sort("avgRating").limit(20)

  //   return Promise.all(
  //  uniqueAuthors.map(async author => {
  //     const regex = new RegExp(author, "i");
  //     return await Book.aggregate([
  //       { $match: { author: regex } },
  //       { $sample: { size: 10 } },
  //       { $sort: { avgRating: -1 } }
  //     ]).exec();
  //   })
  //   );

  // const recommendBooks =await  Book.find({ author: { ...uniqueAuthors } })

  res.json({ books, length: books.length })




}


app.get("/recommendation/:userId", recommendedBooks)


//Routers
app.patch("/toreadlist/:userId/:bookId", addBookToReadList);
app.patch("/currentlyreadinglist/:userId/:bookId", addToCurrentlyReadingList);
app.patch("/finishedlist/:userId/:bookId", addToFinishedList);

app.get("/list/toread/:userId", getToReadList);
app.get("/list/currentlyreading/:userId", getCurrentlyReadingList);
app.get("/list/finished/:userId", getFinishedList);

app.patch("/delete/:userId/:bookId", deleteBookFromList);


app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});