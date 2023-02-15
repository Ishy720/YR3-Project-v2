const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    forename: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    marketingAgreed: { type: Boolean, required: false },
    accountType: { type: String, required: true },
    banned: { type: Boolean, required: false },
    toReadList: [],
    currentlyReadingList: [],
    finishedList: [],
  },

  { timestamps: true }
);

const User = model("User", UserSchema);

module.exports = User;
