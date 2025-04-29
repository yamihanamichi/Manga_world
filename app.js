const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const { createAdminAccount } = require('./controllers/authController');
const open = require('open');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Création du compte admin au démarrage
createAdminAccount();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());

// Middleware pour les variables globales
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth');
const mangaRoutes = require('./routes/manga');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/manga', mangaRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.render('pages/index', { 
        title: 'Accueil',
        page: 'home'
    });
});

app.get('/classement', (req, res) => {
    res.render('pages/classement', { 
        title: 'Classement',
        page: 'classement'
    });
});

app.get('/maliste', isAuthenticated, (req, res) => {
    res.render('pages/maliste', { 
        title: 'Ma Liste',
        page: 'maliste'
    });
});

app.get('/moncompte', (req, res) => {
    res.render('pages/moncompte', { 
        title: 'Mon Compte',
        page: 'moncompte'
    });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log('\x1b[36m%s\x1b[0m', '=== Manga World ===');
    console.log('\x1b[32m%s\x1b[0m', `✓ Serveur démarré sur http://localhost:${port}`);
    console.log('\x1b[33m%s\x1b[0m', '→ Ouverture de votre navigateur...');
    console.log('\x1b[90m%s\x1b[0m', 'Pour arrêter le serveur, fermez cette fenêtre.\n');
    
    // Ouvre le navigateur par défaut
    open(`http://localhost:${port}`);
});