const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt=require("bcrypt")
const generateToken = require("../utils/jwtUtils");

// Create a new user
const createUser = async (req, res) => {
    try {
        console.log("File received:", req.file);
        console.log("Request body:", req.body);

        if (!req.file) {
            return res.status(400).json({ message: 'Profile image is required!' });
        }

        const { firstName, lastName, email, password, phoneNumber, address } = req.body;
        // const { firstName, lastName, email, password, role, phoneNumber, address } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Please fill in all required fields!' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profileImage: imagePath,
            phoneNumber,
            address,
        });

        res.status(201).json({ message: "User registered successfully!", user });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(400).json({ message: err.message || 'Signup failed' });
    }
};

// In your loginUser function in userController.js
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Static admin check
        if (email === 'admin@gmail.com' && password === 'admin123') {
            const adminUser = {
                _id: 'static_admin_id',
                email: 'admin@gmail.com',
                role: 'admin',
                profileImage: '/uploads/admin.png' // You can add a default admin image
            };
            
            const token = generateToken({ 
                userId: adminUser._id,
                email: adminUser.email,
                role: adminUser.role
            });

            return res.status(200).json({
                message: "Admin login successful!",
                token,
                user: {
                    userId: adminUser._id,
                    email: adminUser.email,
                    profileImage: adminUser.profileImage,
                    role: adminUser.role
                }
            });
        }

        // Regular user login
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const token = generateToken({ 
            userId: user._id,
            email: user.email,
            role: user.role  
        });

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                userId: user._id,    
                email: user.email,
                profileImage: user.profileImage,
                role: user.role
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from token
        const updates = req.body;

        // Handle profile image update if included
        if (req.file) {
            updates.profileImage = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ message: "User updated successfully!", updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get current user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userData.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
  
module.exports = { createUser, loginUser, updateUser, getUserProfile};




