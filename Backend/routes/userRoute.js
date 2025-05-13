const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const upload = require('../utils/multerConfig');
const { createUser, loginUser, getUserProfile, updateUser } = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

// Existing routes
router.post('/register', upload, createUser);
router.post('/login', loginUser);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile/:id', authenticate, upload, updateUser);

// Admin user management routes (only accessible by admin@gmail.com)
router.get('/admin/users', authenticate, async (req, res) => {
  try {
    // Check if the authenticated user is the admin
    if (req.userData.email !== 'admin@gmail.com') {
      return res.status(403).json({ message: "Forbidden - Admin access only" });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

router.put('/admin/users/:id', authenticate, async (req, res) => {
  try {
    // Check if the authenticated user is the admin
    if (req.userData.email !== 'admin@gmail.com') {
      return res.status(403).json({ message: "Forbidden - Admin access only" });
    }

    const { firstName, lastName, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

router.delete('/admin/users/:id', authenticate, async (req, res) => {
  try {
    // Check if the authenticated user is the admin
    if (req.userData.email !== 'admin@gmail.com') {
      return res.status(403).json({ message: "Forbidden - Admin access only" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// In userRoutes.js
router.get('/verify-token', authenticate, (req, res) => {
  res.status(200).json({ success: true, user: req.userData });
});

// Remove role-based routes since we're not using roles
router.get('/admin', authenticate, (req, res) => {
  if (req.userData.email !== 'admin@gmail.com') {
    return res.status(403).json({ message: "Forbidden - Admin access only" });
  }
  res.send("Admin Dashboard");
});

module.exports = router;