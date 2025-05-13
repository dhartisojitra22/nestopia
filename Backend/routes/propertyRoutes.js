

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/multer_config");
const {
    addProperty,
    getAllProperties,
    getPendingProperties,
    approveProperty,
    rejectProperty,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertiesByAdmin,
    getRejectedProperties,contactPropertyOwner,getPropertyOwner,getPropertyInquiries
} = require("../controllers/propertyController");

// Create a property (Protected Route)
router.post("/createprop", authenticate, upload.single("image"), addProperty);

// Get all approved properties
router.get("/getallprop", getAllProperties);

router.get("/pending", authenticate, authorize(['admin']), getPendingProperties);
router.patch("/approve/:id", authenticate, authorize(['admin']), approveProperty);
router.patch("/reject/:id", authenticate, authorize(['admin']), rejectProperty);
// In propertyRoutes.js
router.get("/rejected", authenticate, authorize(['admin']), getRejectedProperties);
// Get property by ID
router.get("/getprop/:id", getPropertyById);

// Get properties by user ID
router.get("/getbyadmin", authenticate, getPropertiesByAdmin);

// Update property
router.patch("/updateprop/:id", authenticate, upload.single("image"), updateProperty);

// Delete property
router.delete("/deleteprop/:id", authenticate, deleteProperty);
router.get("/owner/:id", getPropertyOwner);
// Remove authentication middleware for contact route
router.post("/contact/:id", contactPropertyOwner);

router.get("/inquiries/property/:propertyId", authenticate, getPropertyInquiries);

module.exports = router;