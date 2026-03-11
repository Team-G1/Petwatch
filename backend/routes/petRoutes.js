// backend/routes/petRoutes.js
const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');

// Get all pets for a user
router.get('/users/:userId/pets', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verify the authenticated user matches the requested user
        if (req.user.id !== userId && req.user._id !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        console.log('GET /users/:userId/pets - userId:', userId);
        
        const pets = await Pet.find({ userId: userId, isActive: true }).sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ message: 'Error fetching pets' });
    }
});

// Add new pet
router.post('/users/:userId/pets', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verify the authenticated user matches the requested user
        if (req.user.id !== userId && req.user._id !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        console.log('POST /users/:userId/pets - userId:', userId, 'body:', req.body);
        
        const petData = { 
            ...req.body, 
            userId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const newPet = new Pet(petData);
        await newPet.save();
        
        res.status(201).json(newPet);
    } catch (error) {
        console.error('Error saving pet:', error);
        res.status(500).json({ message: 'Error saving pet' });
    }
});

// Update pet
router.put('/users/:userId/pets/:petId', auth, async (req, res) => {
    try {
        const { userId, petId } = req.params;
        
        // Verify the authenticated user matches the requested user
        if (req.user.id !== userId && req.user._id !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        const petData = {
            ...req.body,
            updatedAt: new Date()
        };
        
        const updatedPet = await Pet.findOneAndUpdate(
            { _id: petId, userId: userId },
            petData,
            { new: true }
        );
        
        if (!updatedPet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        res.json(updatedPet);
    } catch (error) {
        console.error('Error updating pet:', error);
        res.status(500).json({ message: 'Error updating pet' });
    }
});

// Delete pet (soft delete)
router.delete('/users/:userId/pets/:petId', auth, async (req, res) => {
    try {
        const { userId, petId } = req.params;
        
        // Verify the authenticated user matches the requested user
        if (req.user.id !== userId && req.user._id !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        const deletedPet = await Pet.findOneAndUpdate(
            { _id: petId, userId: userId },
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );
        
        if (!deletedPet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).json({ message: 'Error deleting pet' });
    }
});

module.exports = router;