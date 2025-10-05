const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/users');

// Signup
router.post('/signup', userCtrl.newUser);

// Login
router.post('/login', userCtrl.loginUSer);


module.exports = router;