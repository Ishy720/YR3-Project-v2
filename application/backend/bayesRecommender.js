//Imports
const { removeStopwords, eng } = require('stopword')
const Book = require("./models/BookSchema.js");
const fs = require('fs');
const mongoose = require("mongoose");
const natural = require('natural');

require("dotenv").config();

//DB Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Recommendation engine connected to MongoDB");
    findSimilarBooks("63d53dce0dcdd4cc1d126851");
    //trainClassifier();
    //getBookCountByGenre();
    //printComicBookTitles();
  })
  .catch((err) => {
    console.log(err);
});

/*
const printComicBookTitles = async () => {
    const books = await Book.find({ genres: /Comic Book/i });
    books.forEach((book) => {
      console.log(book.title);
    });
};
*/

/*
const getBookCountByGenre = async () => {
    const genres = await Book.distinct('genres');
    const genreCounts = await Promise.all(
      genres.map(async (genre) => {
        const count = await Book.countDocuments({ genres: genre });
        return { genre, count };
      })
    );
    const res = genreCounts.sort((a, b) => b.count - a.count);
    console.log(res);
};
*/

//takes in text and removes stopwords, then tokenizes them (splits text into array of words)
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

const trainClassifier = async () => {
    console.log("Getting all books");
    const books = await Book.find({ genres: /Comic Book/i });

    console.log("Making classifier");
    const classifier = new natural.BayesClassifier();

    count = 0;
  
    console.log("Adding docs");
    books.forEach(book => {
      const titleTokens = tokenize(book.title);
      const authorTokens = tokenize(book.author);
      const descriptionTokens = tokenize(book.description);

      classifier.addDocument(titleTokens, book._id.toString());
      classifier.addDocument(authorTokens, book._id.toString());
      classifier.addDocument(descriptionTokens, book._id.toString());

      count++;
      console.log("Count: " + count);

    });
    
    console.log("Training");
    classifier.train();
  
    const classifierJson = JSON.stringify(classifier);
    console.log("Writing file");
    fs.writeFileSync('comicClassifier.json', classifierJson);
};
  
const loadClassifier = () => {
    const classifierJson = fs.readFileSync('comicClassifier.json');
    const classifier = natural.BayesClassifier.restore(JSON.parse(classifierJson));
    return classifier;
};

const getBooksByIds = async (bookIds) => {
    const books = await Book.find({ _id: { $in: bookIds } });
    return books;
}

const findSimilarBooks = async (bookId) => {
    const classifier = loadClassifier();
    const inputBook = await Book.findById(bookId);
    const inputTitleTokens = tokenize(inputBook.title);
    const inputAuthorTokens = tokenize(inputBook.author);
    const inputDescriptionTokens = tokenize(inputBook.description);
    const inputFeatures = [...inputTitleTokens, ...inputAuthorTokens, ...inputDescriptionTokens];


    /*
    const inputFeatures = [
      inputBook.title,
      inputBook.author,
      inputBook.description
    ];*/

    const categories = classifier.getClassifications(inputFeatures)
    .sort((a, b) => b.value - a.value)
    .slice(0, 30)
    .map((classification) => {
        return {
            id: classification.label,
            score: classification.value
        };
    });

    console.log(`Top 10 similar books for book ${bookId}:`);
    const results = await getBooksByIds(categories.map((category) => category.id));
    for (const book of results) {
        const similarityScore = categories.find((category) => category.id === book.id).score;
        console.log(`Book: ${book.title} - Similarity score: ${similarityScore}`);
    }


    /*
    const categories = classifier.getClassifications(inputFeatures)
    .sort((a, b) => b.value - a.value)
    .slice(0, 30)
    .map((classification) => classification.label);
    console.log(`Top 10 similar books for book ${bookId}:`);
    const results = await getBooksByIds(categories);
    for(const book in results) {
        console.log(results[book].title);
    }
    */


    /*
    const category = classifier.classify(inputFeatures);
    console.log(category);
    const output = await Book.findById(category);
    console.log(output);
    */
};

  //"63d53dd10dcdd4cc1d12a77c" "Avengers vs. X-Men Omnibus"
  //"63d53dce0dcdd4cc1d127035" "Batman, Volume 3: Death of the Family"
 // "63d53dce0dcdd4cc1d126851" Xmen