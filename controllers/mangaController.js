const db = require('../config/database');

exports.getUserMangas = async (req, res) => {
    try {
        const [mangas] = await db.execute(
            'SELECT * FROM user_manga_list WHERE user_id = ? ORDER BY added_at DESC',
            [req.session.userId]
        );
        res.json(mangas);
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.addManga = async (req, res) => {
    try {
        const { mal_id, title, image_url } = req.body;
        const userId = req.session.userId;

        await db.execute(
            'INSERT INTO user_manga_list (user_id, mal_id, title, image_url) VALUES (?, ?, ?, ?)',
            [userId, mal_id, title, image_url]
        );

        res.json({ message: 'Manga ajouté avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du manga:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.removeManga = async (req, res) => {
    try {
        const { mal_id } = req.params;
        const userId = req.session.userId;

        await db.execute(
            'DELETE FROM user_manga_list WHERE user_id = ? AND mal_id = ?',
            [userId, mal_id]
        );

        res.json({ message: 'Manga supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du manga:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateMangaStatus = async (req, res) => {
    try {
        const { mal_id } = req.params;
        const { status } = req.body;
        const userId = req.session.userId;

        // Vérifier que le statut est valide
        const validStatuses = ['plan_to_read', 'reading', 'completed', 'on_hold', 'dropped'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        const [result] = await db.execute(
            'UPDATE user_manga_list SET status = ? WHERE user_id = ? AND mal_id = ?',
            [status, userId, mal_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Manga non trouvé dans votre liste' });
        }

        res.json({ message: 'Statut du manga mis à jour' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};