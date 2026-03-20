const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const tradesController = require("./trades.controller");
const router = express.Router();

router.post("/", authenticate, tradesController.createTrade);
router.patch("/:id", authenticate, tradesController.updateTrade);
router.patch("/:id/close", authenticate, tradesController.closeTrade);
router.get("/:id", tradesController.getTradeById);
module.exports = router;
