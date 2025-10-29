const userModel = require('../models/user.model');

module.exports.createUser = async ({
    firstname, lastname, email, password
}) => {
    if (!firstname || !email || !password) {
        throw new Error('All fields are required');
    }
    
    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    
    const user = await userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password
    });

    return user;
}

module.exports.findUserByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }
    
    return await userModel.findByEmail(email);
}

module.exports.findUserById = async (id) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    
    return await userModel.findById(id);
}

module.exports.updateUser = async (id, updateData) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    
    return await userModel.update(id, updateData);
}

module.exports.deleteUser = async (id) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    
    return await userModel.delete(id);
}

module.exports.getAllUsers = async () => {
    return await userModel.findAll();
}