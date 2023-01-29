//Import server
const app = require("./server.js");

//Database asset imports
const mongoose = require("mongoose");
const User = require("./models/UserSchema.js");
const Book = require("./models/BookSchema.js");

app.get("/test", function (req, res) {
  res.status(200).json({ message: "Success!" });
});

app.get("/isLoggedIn", function (req, res) {
  if (req.session.loggedIn) {
    console.log("Session exists");
    res.status(200).json({ message: "A session exists" });
  } else {
    console.log("Session doesn't exist");
    res.status(400).json({ message: "No session exists" });
  }
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
  const bookModel = mongoose.model('Book');
  bookModel.find({title: { $regex: searchTerm, $options: 'i' } }).limit(10)
    .then((results) => {
      res.json({books: results});
    })
    .catch((err) => {
      throw err;
    });
});

//When a user registers a new account
app.post("/registerNewUser", async function (req, res) {
  //Get user details
  const { username, forename, surname, email, password, marketingAgreed } =
    req.body;

  //Validate inputs!!!

  //Check if username already exists
  User.exists({ username: username }, async function (error, result) {
    if (error) throw error;

    if (!result) {
      //Encrypt password, email

      const newUser = User({
        username: username,
        forename: forename,
        surname: surname,
        email: email,
        password: password,
        marketingAgreed: marketingAgreed,
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
      //   res.json({ message: "Nice one mate" });
      res.status(201).json({ message: "Nice one mate" });
    } else {
      console.log("User already exists!");
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
          const { _id, username, password } = returnedDocument;

          if (retrievedPassword == password) {

            req.session.authenticated = true;
            req.session.user = {
              id: _id,
              username: username,
              loggedIn: true,
            };

            console.log("Logged in user");

            res.status(200).json({
              message: "You have successfully logged into your account!",
              user: username
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
