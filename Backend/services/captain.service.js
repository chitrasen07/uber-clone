const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }
    
    // Check if captain already exists
    const existingCaptain = await captainModel.findByEmail(email);
    if (existingCaptain) {
        throw new Error('Captain with this email already exists');
    }
    
    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    });

    return captain;
}

module.exports.findCaptainByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }
    
    return await captainModel.findByEmail(email);
}

module.exports.findCaptainById = async (id) => {
    if (!id) {
        throw new Error('Captain ID is required');
    }
    
    return await captainModel.findById(id);
}

module.exports.updateCaptain = async (id, updateData) => {
    if (!id) {
        throw new Error('Captain ID is required');
    }
    
    return await captainModel.update(id, updateData);
}

module.exports.updateCaptainLocation = async (id, latitude, longitude) => {
    if (!id || latitude === undefined || longitude === undefined) {
        throw new Error('Captain ID, latitude, and longitude are required');
    }
    
    return await captainModel.updateLocation(id, latitude, longitude);
}

module.exports.updateCaptainStatus = async (id, status) => {
    if (!id || !status) {
        throw new Error('Captain ID and status are required');
    }
    
    if (!['active', 'inactive'].includes(status)) {
        throw new Error('Status must be either active or inactive');
    }
    
    return await captainModel.updateStatus(id, status);
}

module.exports.findActiveCaptains = async () => {
    return await captainModel.findActiveCaptains();
}

module.exports.findCaptainsByLocation = async (latitude, longitude, radius = 5000) => {
    if (latitude === undefined || longitude === undefined) {
        throw new Error('Latitude and longitude are required');
    }
    
    return await captainModel.findByLocation(latitude, longitude, radius);
}

module.exports.deleteCaptain = async (id) => {
    if (!id) {
        throw new Error('Captain ID is required');
    }
    
    return await captainModel.delete(id);
}

module.exports.getAllCaptains = async () => {
    return await captainModel.findAll();
}