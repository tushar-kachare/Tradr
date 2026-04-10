const express = require("express");
const router = express.Router();
const { uploadAvatar } = require("../../config/cloudinary");

const authenticate = require("../middlewares/auth.middleware");
const usersController = require("./users.controller");

router.get("/me", authenticate, usersController.me);
router.delete("/me", authenticate, usersController.deleteMe);
router.patch("/me", authenticate, usersController.updateMe);
router.patch("/me/password", authenticate, usersController.changePassword);
router.get("/:userId/likes", authenticate, usersController.getUserLikes);
router.get(
  "/:userId/bookmarks",
  authenticate,
  usersController.getUserBookmarks,
);
router.patch(
  "/me/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  usersController.updateAvatar,
);
router.get("/search", authenticate, usersController.searchUser);
router.get('/top' , authenticate , usersController.getTopUsers)
// ** Keep dynamic API at bottom ** //
router.post("/:username/follow", authenticate, usersController.followUser);
router.delete("/:username/follow", authenticate, usersController.unFollowUser);
router.get("/:username/followers", authenticate, usersController.getFollowers);
router.get("/:username/following", authenticate, usersController.getFollowing);
router.get("/:userId/posts", authenticate, usersController.getUserPosts);
router.get(
  "/:username/portfolio",
  authenticate,
  usersController.getUserPortfolio,
);
router.get("/:username/trades", authenticate, usersController.getUserTrades);
router.get("/:username", authenticate, usersController.getUserByUsername);
module.exports = router;
