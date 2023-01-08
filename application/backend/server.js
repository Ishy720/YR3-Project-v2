//Modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const cookieParser = require("cookie-parser");
const port = 8080;
require("dotenv/config");

//Database Imports
const mongoose = require("mongoose");

//Enable cross origin resource sharing to allow ports to communicate
// app.use(cors());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // the origin of the client
  })
);
app.use(cookieParser());

//Enable json parsing and URL encoding
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const oneDay = 1000 * 60 * 60 * 24;

//Initialise session
app.use(
  session({
    secret: "Reeeeeeeeeehahahahahahahaahahahaha",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: oneDay, httpOnly: false },
  })
);

//DB Connection and Server start
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    //Start server
    app.listen(process.env.PORT || port, () =>
      console.info(`Listening on port ${port}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = app;

//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

//const path = require('path');

/*
//Catch any undeclared routes and display error page [KEEP AT BOTTOM OF ROUTING ORDER]
app.get('*', function(req, res) {
    res.sendFile(resolvePath('index.html'));
});

//-------------------------------------------------------------
//FUNCTIONS
//-------------------------------------------------------------

//Resolve file paths using filename passed
function resolvePath(fileName) {
    return path.join(__dirname, 'build', fileName);
};

//-------------------------------------------------------------
//WEB SECURITY
//-------------------------------------------------------------

//Illegal views
var explicitPaths = ['/index.html'];

//Remove access to static views
app.get(explicitPaths, function(req, res) {
    //res.sendFile(path.join(__dirname, 'build', 'badReq.html'));
    res.sendFile(resolvePath('index.html'))
});

//-------------------------------------------------------------
//ROUTES
//-------------------------------------------------------------

//Use build folder for assets
app.use(express.static(path.join(__dirname, 'build')));

//Home page
app.get('/', function(req, res) {
    res.sendFile(resolvePath('index.html'));
});

app.post('/userDetails', async (req, res) => {
    console.log("Called");
    res.json({message: true});

});

*/
