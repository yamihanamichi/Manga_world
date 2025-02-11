const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendAdminWelcomeEmail = async (email) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Configuration email manquante, email non envoyé');
            return;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Bienvenue sur Manga World - Compte Administrateur',
            html: `
                <h1>Bienvenue sur Manga World !</h1>
                <p>Votre compte administrateur a été créé avec succès.</p>
                <p>Vous avez maintenant accès au dashboard administrateur et à toutes les fonctionnalités de gestion.</p>
                <p>Cordialement,<br>L'équipe Manga World</p>
            `
        });
        console.log('Email de bienvenue admin envoyé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};

exports.sendUserWelcomeEmail = async (email, username) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Configuration email manquante, email non envoyé');
            return;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Bienvenue sur Manga World !',
            html: `
                <h1>Bienvenue sur Manga World, ${username} !</h1>
                <p>Votre compte a été créé avec succès.</p>
                <p>Vous pouvez maintenant :</p>
                <ul>
                    <li>Explorer notre vaste collection de mangas</li>
                    <li>Créer votre liste personnalisée</li>
                    <li>Partager vos avis avec la communauté</li>
                </ul>
                <p>Nous vous souhaitons une excellente expérience sur notre plateforme !</p>
                <p>Cordialement,<br>L'équipe Manga World</p>
            `
        });
        console.log('Email de bienvenue utilisateur envoyé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Configuration email manquante, email non envoyé');
            return;
        }

        const tempPassword = resetToken.substring(0, 8);

        // Hasher le mot de passe temporaire
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Mettre à jour le mot de passe dans la base de données
        const db = require('../config/database');
        await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Réinitialisation de votre mot de passe - Manga World',
            html: `
                <h1>Réinitialisation de votre mot de passe</h1>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Voici votre nouveau mot de passe temporaire : <strong>${tempPassword}</strong></p>
                <p>Nous vous recommandons de le changer dès votre prochaine connexion.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
                <p>Cordialement,<br>L'équipe Manga World</p>
            `
        });
        console.log('Email de réinitialisation envoyé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error; // Propager l'erreur pour la gestion dans le contrôleur
    }
};