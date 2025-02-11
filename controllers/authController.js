const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { sendAdminWelcomeEmail, sendUserWelcomeEmail } = require('./emailController');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Vérification si l'utilisateur existe déjà
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            req.flash('error', 'Nom d\'utilisateur ou email déjà utilisé');
            return res.redirect('/moncompte');
        }

        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion du nouvel utilisateur
        await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Envoi de l'email de bienvenue
        await sendUserWelcomeEmail(email, username);

        req.flash('success', 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        res.redirect('/moncompte');
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        req.flash('error', 'Une erreur est survenue lors de l\'inscription');
        res.redirect('/moncompte');
    }
};

exports.createAdminAccount = async () => {
    try {
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminEmail = 'admin@mangaworld.com';
        
        await db.execute(`
            INSERT INTO users (username, email, password, role) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            password = VALUES(password)
        `, ['admin', adminEmail, hashedPassword, 'admin']);
        
        await sendAdminWelcomeEmail(adminEmail);
        
        console.log('Compte admin créé ou mis à jour avec succès');
    } catch (error) {
        console.error('Erreur lors de la création du compte admin:', error);
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Tentative de connexion pour:', username);

        // Recherche de l'utilisateur
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (users.length === 0) {
            console.log('Utilisateur non trouvé ou compte banni');
            req.flash('error', 'Identifiants incorrects ou compte banni');
            return res.redirect('/moncompte');
        }

        const user = users[0];
        console.log('Utilisateur trouvé:', user.username);

        // Vérification du mot de passe
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Mot de passe valide:', isValid);

        if (!isValid) {
            req.flash('error', 'Identifiants incorrects');
            return res.redirect('/moncompte');
        }

        // Création de la session
        req.session.userId = user.id;
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        req.flash('success', 'Connexion réussie !');
        res.redirect('/classement');
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        req.flash('error', 'Une erreur est survenue lors de la connexion');
        res.redirect('/moncompte');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
        }
        res.redirect('/');
    });
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        // Vérifier que l'utilisateur est connecté
        if (!userId) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        // Récupérer l'utilisateur
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = users[0];

        // Vérifier l'ancien mot de passe
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};