const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    phoneNumber: { type: String },
    address: { type: String }, 
    notifications: [{
        type: { type: String, enum: ['property_approved', 'property_rejected', 'general'] },
        message: String,
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
