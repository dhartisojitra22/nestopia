// routes/activityRoutes.js
const express = require("express");
const router = express.Router();
const Activity = require("../models/activityModel");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Get recent activities
router.get("/", authenticate, authorize(['admin']), async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activities", error });
    }
});

module.exports = router;