const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const usersController = require("./users.controller");

router.get("/me", authenticate, usersController.me);
router.delete("/me", authenticate, usersController.deleteMe);
router.patch("/me/password", authenticate, usersController.changePassword);
router.get("/me/likes", authenticate, usersController.getMyLikes);
router.get("/me/bookmarks", authenticate, usersController.getMyBookmarks);
router.get("/search", authenticate, usersController.searchUser);
// ** Keep dynamic API at bottom ** //
router.post("/:username/follow", authenticate, usersController.followUser);
router.delete("/:username/follow", authenticate, usersController.unFollowUser);
router.get("/:username/followers", usersController.getFollowers);
router.get("/:username/following", usersController.getFollowing);
router.get("/:userId/posts", authenticate, usersController.getUserPosts);
router.get(
  "/:username/portfolio",
  authenticate,
  usersController.getUserPortfolio,
);
router.get("/:username/trades", authenticate, usersController.getUserTrades);
router.get("/:username", usersController.getUserByUsername);
module.exports = router;
