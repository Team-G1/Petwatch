const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    // Secure Links to User and Pet
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: false
    },
    
    // Service Info
    serviceType: {
        type: String,
        enum: ['Pet Clinic', 'Pet Care', 'Pet Grooming'],
        required: true
    },
    
    // Snapshot of pet details at the time of booking
    petName: String,
    petType: String,
    breed: String,
    age: String,
    weight: String,
    
    // Form specifics
    location: String,
    date: String,
    time: String,
    dateFrom: String,
    dateTo: String,
    timeFrom: String,
    timeTo: String,
    groomingPackage: String,
    
    // Admin specifics
    appointmentNumber: String,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);