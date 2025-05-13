const mongoose = require("mongoose");
const Wishlist = require("../models/wishlistModel");
const Property = require("../models/propertyModel");

exports.addToWishlist = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.userData.userId;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid User ID or Property ID" 
            });
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ 
                success: false,
                message: "Property not found" 
            });
        }

        // Check if already in wishlist
        const existingItem = await Wishlist.findOne({ 
            userId, 
            propertyId 
        });
        
        if (existingItem) {
            return res.status(400).json({ 
                success: false,
                message: "Property already in wishlist" 
            });
        }

        // Create new wishlist item
        const wishlistItem = new Wishlist({
            userId,
            propertyId
        });

        await wishlistItem.save();

        res.status(201).json({
            success: true,
            message: "Property added to wishlist successfully",
            data: wishlistItem
        });

    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add to wishlist",
            error: error.message
        });
    }
};

exports.getWishlistByUser = async (req, res) => {
    try {
        const userId = req.userData.userId;

        const wishlistItems = await Wishlist.find({ userId })
            .populate({
                path: 'propertyId',
                select: 'title location price image bedrooms bathrooms sqft type'
            });

        if (!wishlistItems || wishlistItems.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Your wishlist is empty",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            count: wishlistItems.length,
            data: wishlistItems
        });

    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
            error: error.message
        });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid IDs provided" 
            });
        }

        const deletedItem = await Wishlist.findOneAndDelete({ 
            userId, 
            propertyId 
        });

        if (!deletedItem) {
            return res.status(404).json({ 
                success: false,
                message: "Property not found in your wishlist" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Property removed from wishlist",
            data: deletedItem
        });

    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove from wishlist",
            error: error.message
        });
    }
};