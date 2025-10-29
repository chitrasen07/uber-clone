const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password } = req.body;

        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password
        });

        const token = userModel.generateAuthToken(user.id);

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await userService.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await userModel.comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = userModel.generateAuthToken(user.id);

        res.cookie('token', token);
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getUserProfile = async (req, res, next) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.logoutUser = async (req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        await blackListTokenModel.create({ token });

        res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}