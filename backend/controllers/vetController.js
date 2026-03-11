// backend/controllers/vetController.js
const Vet = require('../models/vet.js');

exports.createVet = async (req, res) => {
    try {
        const newVet = new Vet(req.body);
        const savedVet = await newVet.save();
        res.status(201).json({ success: true, data: savedVet });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
