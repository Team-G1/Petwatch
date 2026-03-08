//vetRoutes.js
const express = require('express');
const router = express.Router();
const Vet = require('../models/vet');

// POST: Add a new veterinarian
router.post('/add', async (req, res) => {
    try {
        const newVet = new Vet(req.body);
        const savedVet = await newVet.save();
        res.status(201).json(savedVet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

