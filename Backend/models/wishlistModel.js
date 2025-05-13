// wishlistModel.js
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    userId: {  // Change from 'user' to 'userId' to match your token
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add compound index to prevent duplicates
wishlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);