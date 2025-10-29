const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } = require('firebase/firestore');

class RideModel {
    constructor() {
        this.collection = collection(db, 'rides');
    }

    // Create a new ride
    async create(rideData) {
        try {
            const rideDataWithTimestamp = {
                ...rideData,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await addDoc(this.collection, rideDataWithTimestamp);
            return { id: docRef.id, ...rideDataWithTimestamp };
        } catch (error) {
            throw new Error(`Error creating ride: ${error.message}`);
        }
    }

    // Find ride by ID
    async findById(id) {
        try {
            const rideDoc = doc(this.collection, id);
            const rideSnap = await getDoc(rideDoc);
            
            if (rideSnap.exists()) {
                return { id: rideSnap.id, ...rideSnap.data() };
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding ride by ID: ${error.message}`);
        }
    }

    // Find rides by user ID
    async findByUserId(userId) {
        try {
            const q = query(
                this.collection, 
                where('user', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error finding rides by user ID: ${error.message}`);
        }
    }

    // Find rides by captain ID
    async findByCaptainId(captainId) {
        try {
            const q = query(
                this.collection, 
                where('captain', '==', captainId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error finding rides by captain ID: ${error.message}`);
        }
    }

    // Find pending rides
    async findPendingRides() {
        try {
            const q = query(
                this.collection, 
                where('status', '==', 'pending'),
                orderBy('createdAt', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error finding pending rides: ${error.message}`);
        }
    }

    // Find rides by status
    async findByStatus(status) {
        try {
            const q = query(
                this.collection, 
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error finding rides by status: ${error.message}`);
        }
    }

    // Find ongoing rides for a captain
    async findOngoingRidesByCaptain(captainId) {
        try {
            const q = query(
                this.collection, 
                where('captain', '==', captainId),
                where('status', '==', 'ongoing')
            );
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error finding ongoing rides by captain: ${error.message}`);
        }
    }

    // Update ride
    async update(id, updateData) {
        try {
            const rideDoc = doc(this.collection, id);
            const updatedData = {
                ...updateData,
                updatedAt: new Date()
            };
            await updateDoc(rideDoc, updatedData);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating ride: ${error.message}`);
        }
    }

    // Accept ride
    async acceptRide(id, captainId) {
        try {
            const rideDoc = doc(this.collection, id);
            await updateDoc(rideDoc, {
                captain: captainId,
                status: 'accepted',
                updatedAt: new Date()
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error accepting ride: ${error.message}`);
        }
    }

    // Start ride
    async startRide(id) {
        try {
            const rideDoc = doc(this.collection, id);
            await updateDoc(rideDoc, {
                status: 'ongoing',
                updatedAt: new Date()
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error starting ride: ${error.message}`);
        }
    }

    // Complete ride
    async completeRide(id, duration, distance) {
        try {
            const rideDoc = doc(this.collection, id);
            await updateDoc(rideDoc, {
                status: 'completed',
                duration: duration,
                distance: distance,
                updatedAt: new Date()
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error completing ride: ${error.message}`);
        }
    }

    // Cancel ride
    async cancelRide(id) {
        try {
            const rideDoc = doc(this.collection, id);
            await updateDoc(rideDoc, {
                status: 'cancelled',
                updatedAt: new Date()
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error cancelling ride: ${error.message}`);
        }
    }

    // Delete ride
    async delete(id) {
        try {
            const rideDoc = doc(this.collection, id);
            await deleteDoc(rideDoc);
            return true;
        } catch (error) {
            throw new Error(`Error deleting ride: ${error.message}`);
        }
    }

    // Get all rides
    async findAll() {
        try {
            const q = query(this.collection, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error getting all rides: ${error.message}`);
        }
    }

    // Get recent rides (last 10)
    async getRecentRides(limitCount = 10) {
        try {
            const q = query(
                this.collection, 
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            const rides = [];
            querySnapshot.forEach((doc) => {
                rides.push({ id: doc.id, ...doc.data() });
            });
            return rides;
        } catch (error) {
            throw new Error(`Error getting recent rides: ${error.message}`);
        }
    }
}

module.exports = new RideModel();