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