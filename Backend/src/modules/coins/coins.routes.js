const express = require("express");
const coinsController = require("./coins.controller");

const router = express.Router();

router.get("/", coinsController.getCoins);

module.exports = router;
