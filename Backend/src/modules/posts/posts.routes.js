const express = require("express");
const { uploadPostMedia } = require("../../config/cloudinary");
const authenticate = require("../middlewares/auth.middleware");
const postController = require("./posts.controller");
const { post } = require("../../config/db");
const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadPostMedia.array("media", 4),
  postController.createPost,
);
router.get("/feed", authenticate, postController.getFeed);
router.get("/explore", authenticate, postController.getExplore);
router.get("/:postId", authenticate, postController.getPost);
router.patch("/:postId", authenticate, postController.updatePost);
router.delete("/:postId", authenticate, postController.deletePost);
router.post("/:postId/like", authenticate, postController.likePost);
router.delete("/:postId/like", authenticate, postController.unlikePost);
router.post("/:postId/bookmark", authenticate, postController.bookmarkPost);
router.delete("/:postId/bookmark", authenticate, postController.unbookmarkPost);
router.post("/:postId/comments", authenticate, postController.createComment);
router.get("/:postId/comments", authenticate, postController.getComments);
router.delete(
  "/:postId/comments/:commentId",
  authenticate,
  postController.deleteComment,
);
module.exports = router;
