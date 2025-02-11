const db = require('../config/database');

exports.getComments = async (req, res) => {
    try {
        const { mal_id } = req.params;
        const [comments] = await db.execute(`
            SELECT c.*, u.username 
            FROM manga_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.mal_id = ?
            ORDER BY c.created_at DESC
        `, [mal_id]);

        res.json(comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { mal_id } = req.params;
        const { comment } = req.body;
        const userId = req.session.userId;

        const [result] = await db.execute(
            'INSERT INTO manga_comments (user_id, mal_id, comment) VALUES (?, ?, ?)',
            [userId, mal_id, comment]
        );

        const [newComment] = await db.execute(`
            SELECT c.*, u.username 
            FROM manga_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.json(newComment[0]);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.session.userId;
        const userRole = req.session.user.role;

        // Vérifier si le commentaire existe
        const [comments] = await db.execute(
            'SELECT id, user_id FROM manga_comments WHERE id = ?',
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ error: 'Commentaire non trouvé' });
        }

        // Si l'utilisateur est admin OU propriétaire du commentaire
        if (userRole === 'admin' || comments[0].user_id === userId) {
            await db.execute('DELETE FROM manga_comments WHERE id = ?', [commentId]);
            return res.json({ message: 'Commentaire supprimé' });
        }

        return res.status(403).json({ error: 'Non autorisé' });
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getAllComments = async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT c.*, u.username 
            FROM manga_comments c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        `);

        res.json(comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};