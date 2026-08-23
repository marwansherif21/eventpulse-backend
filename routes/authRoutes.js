const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

const emailRule = body('email').isEmail().withMessage('A valid email is required').normalizeEmail();
const passwordRule = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

router.post(
    '/register',
    body('name').trim().notEmpty().withMessage('Name is required'),
    emailRule,
    passwordRule,
    validate,
    authController.register
);

router.post('/login', emailRule, body('password').notEmpty().withMessage('Password is required'), validate, authController.login);

module.exports = router;