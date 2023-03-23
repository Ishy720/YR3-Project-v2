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
    findSimilarBooks("640b6eb11024425951abbfde");
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
    const tokenSet = new Set();

    for (const word of relevantWordsArray) {
      const cleanedWord = word.replace(/[^\w\s]|_/g, "").trim();
  
      if (cleanedWord !== "") {
        tokenSet.add(cleanedWord);
      }
    }
  
    return Array.from(tokenSet);
}

function concatenate(tokenArrays) {
    const concatenated = [];
    for (const tokenArray of tokenArrays) {
      const joined = tokenArray.join(' ');
      concatenated.push(joined);
    }
    return concatenated.join(' ');
}

const trainClassifier = async () => {

  const books = await Book.find();
  //const books = await Book.find({ genres: /Comic Book/i });

  const classifier = new natural.BayesClassifier();
  let count = 0;

  books.forEach(book => {
    
    const titleTokens = tokenize(book.title.toLowerCase());
    const authorTokens = tokenize(book.author.toLowerCase());
    const descriptionTokens = tokenize(book.description.toLowerCase());
    const rawTitle = book.title;
    const rawAuthor = book.author;
    const rawDescription = book.description;

    const titleFeatures = concatenate([titleTokens]);
    const authorFeatures = concatenate([authorTokens]);
    const descriptionFeatures = concatenate([descriptionTokens]);
    const fullFeatures = concatenate([titleTokens, authorTokens, descriptionTokens]);

    
    classifier.addDocument(titleFeatures, book._id.toString());
    classifier.addDocument(authorFeatures, book._id.toString());
    classifier.addDocument(descriptionFeatures, book._id.toString());
    classifier.addDocument(fullFeatures, book._id.toString());
    

    classifier.addDocument(rawTitle.toLowerCase(), book._id.toString());
    classifier.addDocument(rawAuthor.toLowerCase(), book._id.toString());
    classifier.addDocument(rawDescription.toLowerCase(), book._id.toString());


    count++;
    console.log(count);
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
  fs.writeFileSync('fullDBClassifer.json', classifierJSON);
  console.log("File saved!");

};
  
const loadClassifier = () => {
    const classifierJson = fs.readFileSync('fullDBClassifer.json');
    const classifier = natural.BayesClassifier.restore(JSON.parse(classifierJson));
    return classifier;
};


const findSimilarBooks = async (bookId) => {
  const classifier = loadClassifier();
  const inputBook = await Book.findById(bookId);

  const titleTokens = tokenize(inputBook.title.toLowerCase());
  const authorTokens = tokenize(inputBook.author.toLowerCase());
  const descriptionTokens = tokenize(inputBook.description.toLowerCase());

  //const inputFeatures = concatenate([titleTokens, authorTokens, descriptionTokens]);
  //const inputFeatures = concatenate([titleTokens, descriptionTokens]);
  const inputFeatures = concatenate([titleTokens]);

  const categories = classifier.getClassifications(inputFeatures)
    .sort((a, b) => b.value - a.value)
    .slice(0, 30)
    .map((classification) => {
      return {
        id: classification.label,
        score: classification.value,
      };
    });

  // Find min and max similarity scores
  const minScore = categories[categories.length - 1].score;
  const maxScore = categories[0].score;

  console.log(`Top 30 similar books for ${inputBook.title}:`);
  const results = await getBooksByIds(categories.map((category) => category.id));

  // Normalize and sort results
  results.sort((a, b) => {
    const scoreA = categories.find((category) => category.id === a.id).score;
    const scoreB = categories.find((category) => category.id === b.id).score;
    const normalizedScoreA = (scoreA - minScore) / (maxScore - minScore);
    const normalizedScoreB = (scoreB - minScore) / (maxScore - minScore);
    return normalizedScoreB - normalizedScoreA;
  });

  for (const book of results) {
    const similarityScore = categories.find((category) => category.id === book.id).score;
    const normalizedScore = (similarityScore - minScore) / (maxScore - minScore) * 100;
    //CHECK SIM SCORES????
    if(normalizedScore > 0) {
      console.log(`Book: ${book.title} - Probability: ${normalizedScore.toFixed(3)}`);
    }
  }
};

//"640b6eb31024425951ac0c6f" New X-Men, Vol 7: Here comes tomorrow
//"640b6eb11024425951abbfde" Batman, Volume 1: The Court of Owls
//"640b6eb01024425951abad25" Harry Potter