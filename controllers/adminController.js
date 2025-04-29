const db = require('../config/database');

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

exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        await db.execute('DELETE FROM manga_comments WHERE id = ?', [commentId]);
        res.json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, username, email, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [users] = await db.execute(
            'SELECT role FROM users WHERE id = ?',
            [userId]
        );

        if (users[0].role === 'admin') {
            return res.status(403).json({ error: 'Impossible de modifier le statut d\'un administrateur' });
        }

        await db.execute(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?',
            [userId]
        );

        res.json({ message: 'Statut de l\'utilisateur mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la modification du statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getMangaStats = async (req, res) => {
    try {
        // Statistiques globales d'abord
        const [globalStats] = await db.execute(`
            SELECT 
                COUNT(DISTINCT user_id) as total_users_with_lists,
                COUNT(DISTINCT mal_id) as unique_mangas,
                COUNT(*) as total_entries
            FROM user_manga_list
        `);

        // Ensuite les mangas les plus ajoutés
        const [topMangas] = await db.execute(`
            SELECT 
                mal_id,
                title,
                image_url,
                COUNT(*) as total_adds,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END) as reading_count,
                SUM(CASE WHEN status = 'plan_to_read' THEN 1 ELSE 0 END) as plan_count
            FROM user_manga_list
            GROUP BY mal_id, title, image_url
            ORDER BY total_adds DESC
            LIMIT 10
        `);

        // Vérifier que nous avons des données valides
        const stats = globalStats[0] || {
            total_users_with_lists: 0,
            unique_mangas: 0,
            total_entries: 0
        };

        res.json({
            topMangas: topMangas || [],
            globalStats: stats
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


