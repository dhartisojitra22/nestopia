const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlistByUser, removeFromWishlist } = require("../controllers/wishlistController");
const authenticate = require("../middleware/authMiddleware");

// Add to wishlist
router.post("/add", authenticate, addToWishlist);

// Get wishlist for authenticated user
router.get("/", authenticate, getWishlistByUser);

// Remove from wishlist (updated to use params)
router.delete("/remove/:propertyId", authenticate, removeFromWishlist);

module.exports = router;