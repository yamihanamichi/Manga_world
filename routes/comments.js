const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Routes publiques
router.get('/manga/:mal_id', commentController.getComments);

// Routes nécessitant une authentification
router.post('/manga/:mal_id', isAuthenticated, commentController.addComment);
router.delete('/:commentId', isAuthenticated, commentController.deleteComment);

// Routes admin
router.get('/all', isAdmin, commentController.getAllComments);

module.exports = router;