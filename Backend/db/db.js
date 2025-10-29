const { db } = require('../config/firebase');

function connectToDb() {
    try {
        console.log('Connected to Firebase Firestore');
        return db;
    } catch (err) {
        console.error('Error connecting to Firebase:', err);
        throw err;
    }
}

module.exports = connectToDb;