const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');

module.exports.registerCaptain = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, vehicle } = req.body;

        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        const token = captainModel.generateAuthToken(captain.id);

        res.status(201).json({ token, captain });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports.loginCaptain = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const captain = await captainService.findCaptainByEmail(email);

        if (!captain) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await captainModel.comparePassword(password, captain.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = captainModel.generateAuthToken(captain.id);

        res.cookie('token', token);
        res.status(200).json({ token, captain });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getCaptainProfile = async (req, res, next) => {
    try {
        res.status(200).json({ captain: req.captain });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.logoutCaptain = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        await blackListTokenModel.create({ token });

        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.updateCaptainLocation = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body;
        const captainId = req.captain.id;

        const captain = await captainService.updateCaptainLocation(captainId, latitude, longitude);

        res.status(200).json({ captain });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.updateCaptainStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const captainId = req.captain.id;

        const captain = await captainService.updateCaptainStatus(captainId, status);

        res.status(200).json({ captain });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getActiveCaptains = async (req, res, next) => {
    try {
        const captains = await captainService.findActiveCaptains();
        res.status(200).json({ captains });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getCaptainsByLocation = async (req, res, next) => {
    try {
        const { latitude, longitude, radius } = req.query;
        const captains = await captainService.findCaptainsByLocation(
            parseFloat(latitude), 
            parseFloat(longitude), 
            radius ? parseInt(radius) : 5000
        );
        res.status(200).json({ captains });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}