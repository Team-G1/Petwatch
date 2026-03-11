<<<<<<< HEAD
// backend/models/Pet.js

const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for faster queries
    },
    petName: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true,
        maxlength: [50, 'Pet name cannot exceed 50 characters']
    },
    petType: {
        type: String,
        required: [true, 'Pet type is required'],
        enum: {
            values: ['Cat', 'Dog'],
            message: 'Pet type must be either Cat or Dog'
        }
    },
    breed: {
        type: String,
        required: [true, 'Breed is required'],
        trim: true
    },
    age: {
        type: String,
        required: [true, 'Age is required'],
        enum: {
            values: ['1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10 years', '11 years', '12 years', '13 years', '14 years', '15 years'],
            message: 'Please select a valid age'
        }
    },
    weight: {
        type: String,
        required: [true, 'Weight is required'],
        enum: {
            values: ['1 Kg', '2 Kg', '3 Kg', '4 Kg', '5 Kg', '6 Kg', '7 Kg', '8 Kg', '9 Kg', '10 Kg', '11 Kg', '12 Kg', '13 Kg', '14 Kg', '15 Kg', '16 Kg', '17 Kg', '18 Kg', '19 Kg', '20 Kg', '21 Kg', '22 Kg', '23 Kg', '24 Kg', '25 Kg', '26 Kg', '27 Kg', '28 Kg', '29 Kg', '30 Kg'],
            message: 'Please select a valid weight'
        }
    },
    medicalNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Medical notes cannot exceed 500 characters']
    },
    vaccinations: [{
        vaccineName: String,
        dateGiven: Date,
        nextDueDate: Date,
        vetName: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This will automatically manage createdAt and updatedAt
});

// Update the updatedAt timestamp before saving
PetSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
PetSchema.index({ userId: 1, petName: 1 });
PetSchema.index({ userId: 1, petType: 1 });

// Virtual for pet's age in months (if needed)
PetSchema.virtual('ageInMonths').get(function() {
    // Parse age string (e.g., "3 years" -> 36)
    const ageStr = this.age;
    if (ageStr.includes('year')) {
        const years = parseInt(ageStr);
        return years * 12;
    }
    return 0;
});

// Method to add vaccination
PetSchema.methods.addVaccination = function(vaccinationData) {
    this.vaccinations.push(vaccinationData);
    return this.save();
};

// Method to get next vaccination due
PetSchema.methods.getNextVaccinationDue = function() {
    const now = new Date();
    const upcomingVaccinations = this.vaccinations
        .filter(v => v.nextDueDate && v.nextDueDate > now)
        .sort((a, b) => a.nextDueDate - b.nextDueDate);
    
    return upcomingVaccinations.length > 0 ? upcomingVaccinations[0] : null;
};

// Static method to find all pets for a user
PetSchema.statics.findByUser = function(userId) {
    return this.find({ userId, isActive: true }).sort({ petName: 1 });
};

// Static method to find pets by type for a user
PetSchema.statics.findByUserAndType = function(userId, petType) {
    return this.find({ userId, petType, isActive: true }).sort({ petName: 1 });
};

const Pet = mongoose.model('Pet', PetSchema);

=======
// backend/models/Pet.js

const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for faster queries
    },
    petName: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true,
        maxlength: [50, 'Pet name cannot exceed 50 characters']
    },
    petType: {
        type: String,
        required: [true, 'Pet type is required'],
        enum: {
            values: ['Cat', 'Dog'],
            message: 'Pet type must be either Cat or Dog'
        }
    },
    breed: {
        type: String,
        required: [true, 'Breed is required'],
        trim: true
    },
    age: {
        type: String,
        required: [true, 'Age is required'],
        enum: {
            values: ['1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10 years', '11 years', '12 years', '13 years', '14 years', '15 years'],
            message: 'Please select a valid age'
        }
    },
    weight: {
        type: String,
        required: [true, 'Weight is required'],
        enum: {
            values: ['1 Kg', '2 Kg', '3 Kg', '4 Kg', '5 Kg', '6 Kg', '7 Kg', '8 Kg', '9 Kg', '10 Kg', '11 Kg', '12 Kg', '13 Kg', '14 Kg', '15 Kg', '16 Kg', '17 Kg', '18 Kg', '19 Kg', '20 Kg', '21 Kg', '22 Kg', '23 Kg', '24 Kg', '25 Kg', '26 Kg', '27 Kg', '28 Kg', '29 Kg', '30 Kg'],
            message: 'Please select a valid weight'
        }
    },
    medicalNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Medical notes cannot exceed 500 characters']
    },
    vaccinations: [{
        vaccineName: String,
        dateGiven: Date,
        nextDueDate: Date,
        vetName: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This will automatically manage createdAt and updatedAt
});

// Update the updatedAt timestamp before saving
PetSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
PetSchema.index({ userId: 1, petName: 1 });
PetSchema.index({ userId: 1, petType: 1 });

// Virtual for pet's age in months (if needed)
PetSchema.virtual('ageInMonths').get(function() {
    // Parse age string (e.g., "3 years" -> 36)
    const ageStr = this.age;
    if (ageStr.includes('year')) {
        const years = parseInt(ageStr);
        return years * 12;
    }
    return 0;
});

// Method to add vaccination
PetSchema.methods.addVaccination = function(vaccinationData) {
    this.vaccinations.push(vaccinationData);
    return this.save();
};

// Method to get next vaccination due
PetSchema.methods.getNextVaccinationDue = function() {
    const now = new Date();
    const upcomingVaccinations = this.vaccinations
        .filter(v => v.nextDueDate && v.nextDueDate > now)
        .sort((a, b) => a.nextDueDate - b.nextDueDate);
    
    return upcomingVaccinations.length > 0 ? upcomingVaccinations[0] : null;
};

// Static method to find all pets for a user
PetSchema.statics.findByUser = function(userId) {
    return this.find({ userId, isActive: true }).sort({ petName: 1 });
};

// Static method to find pets by type for a user
PetSchema.statics.findByUserAndType = function(userId, petType) {
    return this.find({ userId, petType, isActive: true }).sort({ petName: 1 });
};

const Pet = mongoose.model('Pet', PetSchema);

>>>>>>> 1a2889b7d74fe079983d37f7103029d0c6783f98
module.exports = Pet;