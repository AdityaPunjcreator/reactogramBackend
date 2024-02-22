const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "description is a required field"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "location is a required field"],
  },
  // creating likes as array of objects
  likes: [
    {
      type: ObjectId,
      ref: "usercollections",
    },
  ],
  comments: [
    {
      commentText: {
        type: String,
      },
      commentedBy: {
        type: ObjectId,
        ref: "usercollections",
      },
    },
  ],
  image: {
    type: String,
    required: [true, "image is a required field"],
  },
  author: {
    type: ObjectId,
    ref: "usercollections", // collection name of userModal
  },
});

const PostModal = mongoose.model("postcollections", postSchema);

module.exports = PostModal;
