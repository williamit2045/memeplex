////middleware/auth.js
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

module.exports = { isAuthenticated };
