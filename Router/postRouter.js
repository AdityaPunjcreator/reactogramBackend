const express = require("express");
const postController = require("../Controller/post_controller");
const authController = require("../Controller/auth_controller");
const router = express.Router();

router.post("/post", authController.protect, postController.post);
router.get("/allposts", postController.allposts);
router.get("/myposts", authController.protect, postController.getmyposts);
router.delete(
  "/delete/:postId",
  authController.protect,
  postController.deletepost
);
router.get("/:userid", postController.allpostofuser);
router.put("/like", authController.protect, postController.like);
router.put("/dislike", authController.protect, postController.dislike);
router.put("/comment", authController.protect, postController.comment);

module.exports = router;
