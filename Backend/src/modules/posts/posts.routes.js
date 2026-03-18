const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const postController = require("./posts.controller");
const router = express.Router();

router.post("/", authenticate, postController.createPost);
router.get("/feed", authenticate, postController.getFeed);
router.get("/explore", authenticate, postController.getExplore);
router.get("/:postId", authenticate, postController.getPost);
router.patch("/:postId", authenticate, postController.updatePost);
router.delete("/:postId", authenticate, postController.deletePost);

module.exports = router;
