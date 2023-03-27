/*
  This file is responsible for processing and extracting book information found in books.csv, which was sourced from an
  open access dataset of books. The books are then saved to my MongoDB database collection "books".
  Link to dataset website: https://zenodo.org/record/4265096#.ZCGxjXbMJPY
  Direct download link: https://zenodo.org/record/4265096/files/books_1.Best_Books_Ever.csv?download=1
*/

//Module imports
const fs = require("fs");
const { parse } = require("csv-parse");
require("dotenv").config();

//Database imports
const mongoose = require("mongoose");

//Database asset imports
const Book = require("./models/BookSchema");

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

//regex filter to detect unwanted characters in title names: did not successfully capture non-english characters (e.g arabic)
function validateTitle(title) {
  const regex = /^[A-Za-z0-9\s\-_,\.:;()''""]+$/;
  return regex.test(title);
}

//alternate regex check method for characters not in English alphabet, works better than validateTitle
function checkIllegalCharacters(title) {
  const regex = /[^\x00-\x7F]+/g;
  const splitTitle = title.split("");

  if (regex.test(splitTitle[0]))
    return true;

  return false;
}

//tracking number of books filtered and accepted
let count = 0;

//array to hold retrieved books in scraping process
const bookArray = [];


//this function reads the books csv file and for each row of books, extracts and validates data, then pushes the valid books into the mongodb
//database.
function readCSVFile() {
  fs.createReadStream("./books.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {

      //get information of books per row
      const bookInformation = row;

      //extract information
      const title = bookInformation[1].trim();
      const author = bookInformation[3].split(",")[0].trim();
      const releaseDate = bookInformation[14].trim();
      const description = bookInformation[5].trim();
      const imgURL = bookInformation[21].trim();
      const unfilteredGenres = bookInformation[8].substring(1, bookInformation[8].length - 1);
      const avgRating = parseFloat(bookInformation[4].trim());
      const likedPercentage = parseInt(bookInformation[19].trim());
      const unfilteredRatingDistribution = bookInformation[18].substring(1,bookInformation[18].length - 1);
      const language = bookInformation[6].trim();
      const bookType = bookInformation[10].trim();

      //convert genre string into array of genres type string
      const splitGenres = unfilteredGenres.split(",");
      const genres = [];
      for (i in splitGenres) {
        genres.push(splitGenres[i].trim().substring(1, splitGenres[i].trim().length - 1));
      }

      //convert rating string into array of distributions type number
      const splitRatingDistributions = unfilteredRatingDistribution.split(",");
      const ratingDistribution = [];

      for (i in splitRatingDistributions) {
        ratingDistribution.push(
          parseInt(
            splitRatingDistributions[i]
              .trim()
              .substring(1, splitRatingDistributions[i].trim().length - 1)
          )
        );
      }

      //validation rules
      if(language === "English" && 
      //validateTitle(title) &&
      !checkIllegalCharacters(title) && 
      releaseDate != "" &&
      description != "" &&
      imgURL != "" &&
      genres.length != 0 &&
      ratingDistribution.length > 2 &&
      (bookType == "Hardcover" || bookType == "Paperback" || bookType == "Audiobook")) {

        //create new book schema object with the retrieved book attributes
        const newBook = Book({
          title: title,
          author: author,
          releaseDate: releaseDate,
          description: description,
          imgurl: imgURL,
          genres: genres,
          avgRating: avgRating,
          likedPercentage: likedPercentage,
          ratingDistribution: ratingDistribution,
        });

        //push the newly created book object into array
        bookArray.push(newBook);

        //increment the count of books processed
        count++;
      }
      

    }).on("error", function (error) {
      console.log(error.message);
    })
    .on("end", async function () {

      console.log("COMPLETE: No. of books processed: " + count);

      //insert the array of processed books into mongodb database
      try {
        const result = await Book.insertMany(bookArray);
        console.log(result);
      } catch (err) {
        console.log("Error: " + err);
      }

    });
}

//call readCSVFile
readCSVFile();
