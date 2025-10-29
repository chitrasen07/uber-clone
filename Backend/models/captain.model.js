const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class CaptainModel {
    constructor() {
        this.collection = collection(db, 'captains');
    }

    // Create a new captain
    async create(captainData) {
        try {
            const hashedPassword = await bcrypt.hash(captainData.password, 10);
            const captainDataWithHash = {
                ...captainData,
                password: hashedPassword,
                status: 'inactive',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await addDoc(this.collection, captainDataWithHash);
            return { id: docRef.id, ...captainDataWithHash };
        } catch (error) {
            throw new Error(`Error creating captain: ${error.message}`);
        }
    }

    // Find captain by ID
    async findById(id) {
        try {
            const captainDoc = doc(this.collection, id);
            const captainSnap = await getDoc(captainDoc);
            
            if (captainSnap.exists()) {
                return { id: captainSnap.id, ...captainSnap.data() };
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding captain by ID: ${error.message}`);
        }
    }

    // Find captain by email
    async findByEmail(email) {
        try {
            const q = query(this.collection, where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const captainDoc = querySnapshot.docs[0];
                return { id: captainDoc.id, ...captainDoc.data() };
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding captain by email: ${error.message}`);
        }
    }

    // Find active captains
    async findActiveCaptains() {
        try {
            const q = query(this.collection, where('status', '==', 'active'));
            const querySnapshot = await getDocs(q);
            const captains = [];
            querySnapshot.forEach((doc) => {
                captains.push({ id: doc.id, ...doc.data() });
            });
            return captains;
        } catch (error) {
            throw new Error(`Error finding active captains: ${error.message}`);
        }
    }

    // Find captains by location (within radius)
    async findByLocation(latitude, longitude, radius = 5000) {
        try {
            // Note: This is a simplified version. For production, you'd want to use GeoFirestore
            // or implement proper geospatial queries
            const q = query(this.collection, where('status', '==', 'active'));
            const querySnapshot = await getDocs(q);
            const captains = [];
            
            querySnapshot.forEach((doc) => {
                const captain = { id: doc.id, ...doc.data() };
                if (captain.location && captain.location.ltd && captain.location.lng) {
                    const distance = this.calculateDistance(
                        latitude, longitude,
                        captain.location.ltd, captain.location.lng
                    );
                    if (distance <= radius) {
                        captains.push({ ...captain, distance });
                    }
                }
            });
            
            return captains.sort((a, b) => a.distance - b.distance);
        } catch (error) {
            throw new Error(`Error finding captains by location: ${error.message}`);
        }
    }

    // Update captain
    async update(id, updateData) {
        try {
            const captainDoc = doc(this.collection, id);
            const updatedData = {
                ...updateData,
                updatedAt: new Date()
            };
            await updateDoc(captainDoc, updatedData);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating captain: ${error.message}`);
        }
    }

    // Update captain location
    async updateLocation(id, latitude, longitude) {
        try {
            const captainDoc = doc(this.collection, id);
            await updateDoc(captainDoc, {
                location: {
                    ltd: latitude,
                    lng: longitude
                },
                updatedAt: new Date()
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating captain location: ${error.message}`);
        }
    }

    // Update captain status
    async updateStatus(id, status) {
        try {
            const captainDoc = doc(this.collection, id);
            await updateDoc(captainDoc, {
                status: status,
                updatedAt: new Date()
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating captain status: ${error.message}`);
        }
    }

    // Delete captain
    async delete(id) {
        try {
            const captainDoc = doc(this.collection, id);
            await deleteDoc(captainDoc);
            return true;
        } catch (error) {
            throw new Error(`Error deleting captain: ${error.message}`);
        }
    }

    // Get all captains
    async findAll() {
        try {
            const querySnapshot = await getDocs(this.collection);
            const captains = [];
            querySnapshot.forEach((doc) => {
                captains.push({ id: doc.id, ...doc.data() });
            });
            return captains;
        } catch (error) {
            throw new Error(`Error getting all captains: ${error.message}`);
        }
    }

    // Generate auth token
    generateAuthToken(captainId) {
        const token = jwt.sign({ _id: captainId }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return token;
    }

    // Compare password
    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Hash password
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    }
}

module.exports = new CaptainModel();