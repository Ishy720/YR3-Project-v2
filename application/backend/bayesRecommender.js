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
    console.log("Bayes recommendation engine connected to MongoDB");
    //findSimilarBooks("640b6eb01024425951abacea");
    //trainClassifier();
  })
  .catch((err) => {
    console.log(err);
});

const getBooksByIds = async (bookIds) => {
  const books = await Book.find({ _id: { $in: bookIds } });
  return books;
}

//takes in text and removes stopwords, then tokenizes them (splits text into array of words)
function tokenize(text) {
    const splitText = text.split(" ");
    const relevantWordsArray = removeStopwords(splitText, eng);
    const tokens = [];

    for (const word of relevantWordsArray) {
      //removes punctuation from word and converts word to lowercase
      const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim();
  
      if (cleanedWord !== "") {
        tokens.push(cleanedWord);
      }
    }
    return tokens;
}

//concatenates arrays together into one single string
function concatenate(tokenArrays) {
    const concatenated = [];
    for (const tokenArray of tokenArrays) {
      const joined = tokenArray.join(' ');
      concatenated.push(joined);
    }
    return concatenated.join(' ');
}

const trainClassifier = async () => {

  //get all the books from the book database
  const books = await Book.find();

  //instantiate the bayes classifier from the natural library
  const classifier = new natural.BayesClassifier();
  //let count = 0;

  //iterate through each retrieved book from the database
  books.forEach(book => {
    
    //get bag of words representations for title, author, description fields
    const titleTokens = tokenize(book.title.toLowerCase());
    const authorTokens = tokenize(book.author.toLowerCase());
    const descriptionTokens = tokenize(book.description.toLowerCase());

    //get raw fields
    const rawTitle = book.title;
    const rawAuthor = book.author;
    const rawDescription = book.description;

    //convert bag of words representations to strings instead of arrays
    const titleFeatures = concatenate([titleTokens]);
    const authorFeatures = concatenate([authorTokens]);
    const descriptionFeatures = concatenate([descriptionTokens]);

    //concatenate all bag of words into one string
    const fullFeatures = concatenate([titleTokens, authorTokens, descriptionTokens, book.genres]);

    //add the different permutations of the book's text fields to the classifier
    classifier.addDocument(titleFeatures, book._id.toString());
    classifier.addDocument(authorFeatures, book._id.toString());
    classifier.addDocument(descriptionFeatures, book._id.toString());
    classifier.addDocument(fullFeatures, book._id.toString());
    classifier.addDocument(rawTitle.toLowerCase(), book._id.toString());
    classifier.addDocument(rawAuthor.toLowerCase(), book._id.toString());
    classifier.addDocument(rawDescription.toLowerCase(), book._id.toString());

    //count++;
    //console.log(count);
  });

  const start = new Date();
  console.log(start.toUTCString());

  console.log(`Training classifier...`);
  classifier.train();
  const end = new Date();
  console.log(end.toUTCString());
  console.log(`Trained classifier!`);

  const classifierJSON = JSON.stringify(classifier);
  console.log("Writing file...");
  fs.writeFileSync('bookClassifier.json', classifierJSON);
  console.log("File saved!");

};
  
const loadClassifier = () => {
    const classifierJson = fs.readFileSync('bookClassifier.json');
    const classifier = natural.BayesClassifier.restore(JSON.parse(classifierJson));
    return classifier;
};

//returns predicted similar books as recommendations for given input book id
const findSimilarBooks = async (bookId) => {

  //load the trained bayes classifier model
  const classifier = loadClassifier();

  //get the input book by its ID
  const inputBook = await Book.findById(bookId);

  //get bag of words representation of input book
  const titleTokens = tokenize(inputBook.title.toLowerCase());
  //const authorTokens = tokenize(inputBook.author.toLowerCase());
  //const descriptionTokens = tokenize(inputBook.description.toLowerCase());

  const inputFeatures = concatenate([titleTokens]);
  //const inputFeatures = concatenate([authorTokens]);

  //retrieve the book classifications the classifier predicts using the input features, limited to a max of 10
  const categories = classifier.getClassifications(inputFeatures)
    .sort((a, b) => b.value - a.value)
    .slice(0, 30)
    .map((classification) => {
      return {
        id: classification.label,
        score: classification.value,
      };
    });

  //find min and max similarity scores
  const minScore = categories[categories.length - 1].score;
  const maxScore = categories[0].score;

  //retrieve the books from the book database that were predicted by the classifier
  const results = await getBooksByIds(categories.map((category) => category.id));

  //normalise and sort book results to show probability match out of 100
  results.sort((a, b) => {
    const scoreA = categories.find((category) => category.id === a.id).score;
    const scoreB = categories.find((category) => category.id === b.id).score;
    const normalisedScoreA = (scoreA - minScore) / (maxScore - minScore);
    const normalisedScoreB = (scoreB - minScore) / (maxScore - minScore);
    return normalisedScoreB - normalisedScoreA;
  });

  //print out the predicted books with their normalised classification similarity score
  for (const book of results) {
    const similarityScore = categories.find((category) => category.id === book.id).score;
    const normalisedScore = (similarityScore - minScore) / (maxScore - minScore) * 100;
    if(normalisedScore > 0) {
      console.log(`Book: ${book.title} - Normalised Probability: ${normalisedScore.toFixed(10)}`);
    }
  }

  return results;
};

//findSimilarBooks("640b6eb11024425951abbfde");

async function runTest() {
  const memoryBefore = process.memoryUsage().heapUsed
  const start = Date.now()
  findSimilarBooks("640b6eb11024425951abbfde")
    .then((result) => {
      const end = Date.now()
      const memoryUsed = process.memoryUsage().heapUsed
      console.log('Time taken:', (end - start)/1000, 's', '||', 'Memory used:', (memoryUsed - memoryBefore)/(1024 * 1024), 'MB');
      /*
      result.forEach((book) => {
        console.log(book.title);
      });*/
    })
}

runTest();
