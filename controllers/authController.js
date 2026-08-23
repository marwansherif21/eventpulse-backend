const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const createToken = (user) => jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return next(new AppError('Email is already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
        status: 'success',
        token: createToken(user),
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    res.status(200).json({
        status: 'success',
        token: createToken(user)
    });
});