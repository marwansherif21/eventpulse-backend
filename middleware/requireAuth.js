const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('You must be logged in to access this route', 401));
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        return next(new AppError('You must be logged in to access this route', 401));
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        next(new AppError('Invalid or expired token', 401));
    }
}

module.exports = requireAuth;