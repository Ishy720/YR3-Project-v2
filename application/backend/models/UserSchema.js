/*
    This is the schema for the users table in the MongoDB database.
*/

const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    accountType: { type: String, required: true },
    toReadList: [],
    currentlyReadingList: [],
    finishedList: [],
    customList: { type: Object }
  },

  { timestamps: true }
);

const User = model("User", UserSchema);

module.exports = User;
