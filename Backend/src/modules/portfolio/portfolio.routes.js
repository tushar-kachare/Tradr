const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const router = express.Router();

const portfolioController = require("./portfolio.controller");

router.get("/me", authenticate, portfolioController.getPortfolio);
router.post("/", authenticate, portfolioController.createPortfolio);
router.patch("/", authenticate, portfolioController.updatePortfolio);

module.exports = router;
