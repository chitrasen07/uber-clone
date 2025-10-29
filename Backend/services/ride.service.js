const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };

    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto))
    };

    return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}

module.exports.createRide = async ({
    user, pickup, destination, vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType]
    });

    return ride;
}

module.exports.findRideById = async (id) => {
    if (!id) {
        throw new Error('Ride ID is required');
    }
    
    return await rideModel.findById(id);
}

module.exports.findRidesByUserId = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    return await rideModel.findByUserId(userId);
}

module.exports.findRidesByCaptainId = async (captainId) => {
    if (!captainId) {
        throw new Error('Captain ID is required');
    }
    
    return await rideModel.findByCaptainId(captainId);
}

module.exports.findPendingRides = async () => {
    return await rideModel.findPendingRides();
}

module.exports.findRidesByStatus = async (status) => {
    if (!status) {
        throw new Error('Status is required');
    }
    
    return await rideModel.findByStatus(status);
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId || !captain) {
        throw new Error('Ride ID and captain are required');
    }

    const ride = await rideModel.acceptRide(rideId, captain.id);
    
    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;
}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride ID and OTP are required');
    }

    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    const updatedRide = await rideModel.startRide(rideId);
    return updatedRide;
}

module.exports.endRide = async ({ rideId, captain, duration, distance }) => {
    if (!rideId) {
        throw new Error('Ride ID is required');
    }

    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.captain !== captain.id) {
        throw new Error('Unauthorized to end this ride');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    const updatedRide = await rideModel.completeRide(rideId, duration, distance);
    return updatedRide;
}

module.exports.cancelRide = async (rideId) => {
    if (!rideId) {
        throw new Error('Ride ID is required');
    }

    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status === 'completed') {
        throw new Error('Cannot cancel completed ride');
    }

    const updatedRide = await rideModel.cancelRide(rideId);
    return updatedRide;
}

module.exports.updateRide = async (id, updateData) => {
    if (!id) {
        throw new Error('Ride ID is required');
    }
    
    return await rideModel.update(id, updateData);
}

module.exports.deleteRide = async (id) => {
    if (!id) {
        throw new Error('Ride ID is required');
    }
    
    return await rideModel.delete(id);
}

module.exports.getAllRides = async () => {
    return await rideModel.findAll();
}

module.exports.getRecentRides = async (limit = 10) => {
    return await rideModel.getRecentRides(limit);
}