const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');

class BlacklistTokenModel {
    constructor() {
        this.collection = collection(db, 'blacklistTokens');
    }

    // Add token to blacklist
    async create(tokenData) {
        try {
            const tokenDataWithTimestamp = {
                ...tokenData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await addDoc(this.collection, tokenDataWithTimestamp);
            return { id: docRef.id, ...tokenDataWithTimestamp };
        } catch (error) {
            throw new Error(`Error adding token to blacklist: ${error.message}`);
        }
    }

    // Check if token is blacklisted
    async isTokenBlacklisted(token) {
        try {
            const q = query(this.collection, where('token', '==', token));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            throw new Error(`Error checking if token is blacklisted: ${error.message}`);
        }
    }

    // Find token by ID
    async findById(id) {
        try {
            const tokenDoc = doc(this.collection, id);
            const tokenSnap = await getDoc(tokenDoc);
            
            if (tokenSnap.exists()) {
                return { id: tokenSnap.id, ...tokenSnap.data() };
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding token by ID: ${error.message}`);
        }
    }

    // Delete token from blacklist
    async delete(id) {
        try {
            const tokenDoc = doc(this.collection, id);
            await deleteDoc(tokenDoc);
            return true;
        } catch (error) {
            throw new Error(`Error deleting token from blacklist: ${error.message}`);
        }
    }

    // Get all blacklisted tokens
    async findAll() {
        try {
            const querySnapshot = await getDocs(this.collection);
            const tokens = [];
            querySnapshot.forEach((doc) => {
                tokens.push({ id: doc.id, ...doc.data() });
            });
            return tokens;
        } catch (error) {
            throw new Error(`Error getting all blacklisted tokens: ${error.message}`);
        }
    }

    // Clean up expired tokens (optional - you might want to run this periodically)
    async cleanupExpiredTokens() {
        try {
            const now = new Date();
            const q = query(this.collection, where('expiresAt', '<', now));
            const querySnapshot = await getDocs(q);
            
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });
            
            await Promise.all(deletePromises);
            return querySnapshot.size;
        } catch (error) {
            throw new Error(`Error cleaning up expired tokens: ${error.message}`);
        }
    }
}

module.exports = new BlacklistTokenModel();