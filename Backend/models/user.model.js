const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserModel {
    constructor() {
        this.collection = collection(db, 'users');
    }

    // Create a new user
    async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userDataWithHash = {
                ...userData,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await addDoc(this.collection, userDataWithHash);
            return { id: docRef.id, ...userDataWithHash };
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Find user by ID
    async findById(id) {
        try {
            const userDoc = doc(this.collection, id);
            const userSnap = await getDoc(userDoc);
            
            if (userSnap.exists()) {
                return { id: userSnap.id, ...userSnap.data() };
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    // Find user by email
    async findByEmail(email) {
        try {
            const q = query(this.collection, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                return { id: userDoc.id, ...userDoc.data() };
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    // Update user
    async update(id, updateData) {
        try {
            const userDoc = doc(this.collection, id);
            const updatedData = {
                ...updateData,
                updatedAt: new Date()
            };
            await updateDoc(userDoc, updatedData);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    async delete(id) {
        try {
            const userDoc = doc(this.collection, id);
            await deleteDoc(userDoc);
            return true;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Get all users
    async findAll() {
        try {
            const querySnapshot = await getDocs(this.collection);
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            throw new Error(`Error getting all users: ${error.message}`);
        }
    }

    // Generate auth token
    generateAuthToken(userId) {
        const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
}

module.exports = new UserModel();