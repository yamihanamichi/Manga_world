const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated, isAuthenticated } = require('../middleware/auth');

router.post('/register', isNotAuthenticated, authController.register);
router.post('/login', isNotAuthenticated, authController.login);
router.get('/logout', authController.logout);
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;