const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    location: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    type: { type: String, required: true },
    listingStatus: { 
        type: String, 
        required: true,
        enum: ['For Sale', 'For Rent'] 
    },
    adminEmail: { type: String, required: true, index: true  },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    approvalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Property", propertySchema);