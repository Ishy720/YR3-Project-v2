/*
    This is the schema for my books in my MongoDB database.
*/

const { Schema, model } = require('mongoose');

const BookSchema = new Schema({

    title: {type:String, required:true},
    author: {type:String, required:true},
    releaseDate: {type:String, required:true},
    description: {type:String, required:true},
    imgurl: {type:String, required:true},
    genres: {type: [String], required: true}, 
    avgRating: {type:Number, required:true},
    likedPercentage: {type:Number, required: true},
    ratingDistribution: {type: [Number], required: true}

}, {timestamps: true})

const Book = model("Book", BookSchema);

module.exports = Book;