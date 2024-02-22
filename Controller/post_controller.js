const PostModal = require("../Modal/post_modal");

const post = async (request, response) => {
  const { description, location, image } = request.body;
  try {
    if (!description || !location || !image) {
      return response
        .status(400)
        .json({ message: "please provide all the required details" });
    }

    // Get the logged-in user's ID from the request object
    const author = request.user;
    //in the create method, enter the field you want to be displayed to the user
    const postdata = await PostModal.create({
      description: description,
      location: location,
      image: image,
      author: author,
    });
    return response.status(201).json({
      message: "data posted successfully",
      postdata,
    });
  } catch (err) {
    return response.status(400).json({ message: err.message });
  }
};
// getting post of all users
const allposts = async (request, response) => {
  try {
    //used populate as we want to get the details about each author who has posted it and we have also specified the fields that we want
    const allposts = await PostModal.find()
      .populate("author", "_id Fullname Email Image")
      .populate("comments.commentedBy", "Fullname");
    // we wanted to populate the field of commentedBy in all post
    if (allposts) {
      return response.status(200).json({
        message: "data fectched successfully",
        postsCount: allposts.length,
        allposts,
      });
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

const allpostofuser = async (request, response) => {
  try {
    //used populate as we want to get the details about each author who has posted it and we have also specified the fields that we want
    const allposts = await PostModal.find({
      author: request.params.userid,
    }).populate("author", "_id Fullname Email Image");
    // .populate("comments.commentedBy", "Fullname")
    // .populate(); // we wanted to populate the field of commentedBy in all post
    if (allposts) {
      return response.status(200).json({
        message: "data fectched successfully",
        postsCount: allposts.length,
        allposts,
      });
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// getting  all post from a specific logged in user

const getmyposts = async (request, response) => {
  try {
    const myposts = await PostModal.find({ author: request.user._id }).populate(
      "author",
      "_id Fullname Image"
    );
    if (myposts) {
      return response.status(200).json({
        message: "posts fetched successfully",
        postcount: myposts.length,
        myposts,
      });
    }
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
};
// route for deleting the post
const deletepost = async (request, response) => {
  // first we are going to check whether the post requested to be deleted exists or not
  try {
    const { postId } = request.params;
    //finding the post by id
    const posttobedeleted = await PostModal.findById(postId);

    if (!posttobedeleted) {
      return response.status(400).json({ error: "No such post found" });
    }

    // checking if the logged in user owns the post
    const { _id: userId } = request.user;
    if (userId.toString() === posttobedeleted.author._id.toString()) {
      await PostModal.findByIdAndDelete(postId);
      return response
        .status(200)
        .json({ message: "data deleted successfully" });
    } else {
      return response
        .status(403)
        .json({ error: "Unauthorized: You cannot delete this post" });
    }
  } catch (err) {
    return response.status(404).json({ error: err.message });
  }
};

// route handler  for liking the posts

const like = async (request, response) => {
  try {
    const postId = request.body.postId;
    const userId = request.user._id;
    if (!postId) {
      return response.status(400).json({ error: "no post found" });
    }

    // Check if the post has already been liked by the user
    const post = await PostModal.findById(postId);
    if (post.likes.includes(userId)) {
      return response
        .status(400)
        .json({ error: "The post has already been liked" });
    }

    // since we will be passing the Id of the post from the frontend
    const likepost = await PostModal.findByIdAndUpdate(
      request.body.postId,
      {
        $push: { likes: userId }, // when we deal with array and we want to push some data, we use this $push method
      },
      { new: true }
    ).populate("author", "_id Fullname");

    return response
      .status(201)
      .json({ messsage: "liked successfully", likepost });
  } catch (error) {
    return response.status(404).json({ error: err.message });
  }
};

// route handler for disliking the posts
const dislike = async (request, response) => {
  try {
    const postId = request.body.postId;
    const userId = request.user._id;
    if (!postId) {
      return response.status(400).json({ error: "no post found" });
    }

    // since we will be passing the Id of the post from the frontend
    const dislikepost = await PostModal.findByIdAndUpdate(
      request.body.postId, // we are finding the post with this id which we will pass
      {
        $pull: { likes: userId },
      },
      { new: true }
    ).populate("author", "_id Fullname");

    return response
      .status(201)
      .json({ messsage: "disliked successfully", dislikepost });
  } catch (error) {
    return response.status(404).json({ error: err.message });
  }
};

const comment = async (request, response) => {
  try {
    const commentobject = {
      commentText: request.body.commentText,
      commentedBy: request.user._id,
    };
    // we only need two properties to add comment, commmentText and Id of the post on which you want to do the comment
    const commentonpost = await PostModal.findByIdAndUpdate(
      request.body.postId,
      { $push: { comments: commentobject } },
      { new: true }
    )
      .populate("comments.commentedBy", "_id Fullname") // comment owner
      .populate("author", "_id Fullname"); //we also want to have the author of the post and populated the author field
    if (!commentonpost) {
      return response.status(400).json({ error: "no such post found" });
    }
    return response.status(201).json({
      message: "commented successfully",
      commentonpost,
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

module.exports = {
  post,
  allposts,
  getmyposts,
  allpostofuser,
  deletepost,
  like,
  dislike,
  comment,
};
