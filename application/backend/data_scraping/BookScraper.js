//Module imports
const fs = require("fs");
const { parse } = require("csv-parse");
require("dotenv").config();

//Database imports
const mongoose = require("mongoose");

//Database asset imports
const Book = require("./models/BookSchema");

//DB Connection and Server start
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

//Takes book attributes and saves into database
async function saveBook(
  bookTitle,
  bookAuthor,
  bookYear,
  bookISBN,
  bookImgURL,
  bookGenres,
  bookRating1,
  bookRating2,
  bookRating3,
  bookRating4,
  bookRating5
) {
  const newBook = Book({
    title: bookTitle,
    author: bookAuthor,
    year: bookYear,
    isbn: bookISBN,
    imgurl: bookImgURL,
    genres: bookGenres,
    rating1: bookRating1,
    rating2: bookRating2,
    rating3: bookRating3,
    rating4: bookRating4,
    rating5: bookRating5,
  });

  try {
    await newBook
      .save()
      .then(function (data) {
        console.log(`Inserted\n${data}\ninto LibraryDB.books`);
      })
      .catch(console.error);
  } catch (error) {
    console.log(`Could not add entry to database! Error: ${error}`);
  }
}

//regex filter to detect unwanted characters in title names
function validateTitle(title) {
  const regex = /^[A-Za-z0-9\s\-_,\.:;()''""]+$/;
  return regex.test(title);
}

function checkIllegalCharacters(title) {
  const regex = /[^\x00-\x7F]+/g;
  const splitTitle = title.split("");

  if (regex.test(splitTitle[0]))
    return true;


  return false;
}

//Prevent DDoS attack so I don't get banned like I was with Google twice.
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/*
function readCSVFile() {
  let bookArray = [];

  let testArray = [];

  let count = 0;

  fs.createReadStream("./books.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
      if (
        (validateTitle(row[1].trim()) == true &&
          row[18].trim().length > 2 &&
          row[5].trim().length >= 1 &&
          row[10].trim() == "Hardcover") ||
        row[10].trim() == "Paperback" ||
        row[10].trim() == "Audiobook"
      ) {
        let title = row[1].trim();
        let author = row[3].trim();
        let releaseDate = row[14].trim();
        let description = row[5].trim();
        let imgURL = row[21].trim();
        let unfilteredGenres = row[8].substring(1, row[8].length - 1);
        let avgRating = parseFloat(row[4].trim());
        let likedPercentage = parseInt(row[19].trim());
        let unfilteredRatingDistribution = row[18].substring(
          1,
          row[18].length - 1
        );

        if (
          unfilteredGenres.length >= 1 &&
          row[19].trim().length > 0 &&
          row[4].trim().length > 0 &&
          author.length > 0 &&
          unfilteredRatingDistribution.length > 2 &&
          description.length != 0 &&
          releaseDate.length != 0 &&
          imgURL.length != 0
        ) {
          let splitGenres = unfilteredGenres.split(",");
          let genres = [];
          for (i in splitGenres) {
            genres.push(
              splitGenres[i]
                .trim()
                .substring(1, splitGenres[i].trim().length - 1)
            );
          }

          let splitRatingDistributions =
            unfilteredRatingDistribution.split(",");
          let ratingDistribution = [];
          for (i in splitRatingDistributions) {
            ratingDistribution.push(
              parseInt(
                splitRatingDistributions[i]
                  .trim()
                  .substring(1, splitRatingDistributions[i].trim().length - 1)
              )
            );
          }

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

          bookArray.push(newBook);

          //sleep(750);

          count++;
        } else {
          console.log("Bad book " + title);
        }
      }
    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", async function () {
      console.log("COMPLETE: No. of books processed: " + count);
      //console.log(bookArray);

      /*
        testArray[0] = bookArray[0];
        testArray[1] = bookArray[1];
        testArray[2] = bookArray[2];
        

      //console.log(testArray[0]);

      try {
        const result = await Book.insertMany(bookArray);
        console.log(result);
      } catch (err) {
        console.log("Error: " + err);
      }
    });
}*/

function findBookByTitle(books, title) {
  return books.find(book => book.title === title) || null;
}

let count = 0;
const bookArray = [];

function readCSVFile() {
  fs.createReadStream("./books.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {

      const bookInformation = row;


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

      const splitGenres = unfilteredGenres.split(",");
      const genres = [];
      for (i in splitGenres) {
        genres.push(splitGenres[i].trim().substring(1, splitGenres[i].trim().length - 1));
      }

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

        //console.log(ratingDistribution);

        
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

        bookArray.push(newBook);
        

        count++;
      }
      

    }).on("error", function (error) {
      console.log(error.message);
    })
    .on("end", async function () {


      console.log("COMPLETE: No. of books processed: " + count);

      
      try {
        const result = await Book.insertMany(bookArray);
        console.log(result);
      } catch (err) {
        console.log("Error: " + err);
      }
      

    });
}

readCSVFile();
