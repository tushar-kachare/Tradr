const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authenticate = require('../middlewares/auth.middleware')

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authenticate, authController.register);

module.exports = router;
