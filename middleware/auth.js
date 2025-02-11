const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'Veuillez vous connecter pour accéder à cette page');
    res.redirect('/moncompte');
};

const isNotAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next();
    }
    res.redirect('/');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Accès non autorisé' });
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    isAdmin
};