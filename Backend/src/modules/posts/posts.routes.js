const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const postController = require('./posts.controller')
const router = express.Router();

router.post('/create' , authenticate, postController.createPost);

module.exports = router;