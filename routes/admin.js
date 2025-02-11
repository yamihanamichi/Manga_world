const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Protection de toutes les routes admin
router.use(isAdmin);

// Dashboard
router.get('/', (req, res) => {
    res.render('pages/admin/dashboard', {
        title: 'Dashboard Admin',
        page: 'admin'
    });
});

// Gestion des commentaires
router.get('/comments/all', adminController.getAllComments);
router.delete('/comments/:commentId', adminController.deleteComment);

// Gestion des utilisateurs
router.get('/users', adminController.getUsers);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);

// Statistiques des mangas
router.get('/manga-stats', adminController.getMangaStats);

module.exports = router;