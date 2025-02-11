const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/list', isAuthenticated, mangaController.getUserMangas);
router.post('/add', isAuthenticated, mangaController.addManga);
router.delete('/remove/:mal_id', isAuthenticated, mangaController.removeManga);
router.put('/update/:mal_id', isAuthenticated, mangaController.updateMangaStatus);

module.exports = router;