const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendAdminConfirmation = async (email) => {
    try {
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
        console.log('Email de confirmation envoyé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};