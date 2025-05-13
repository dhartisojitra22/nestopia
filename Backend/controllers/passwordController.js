const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// Forgot Password Function
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }

    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const emailSubject = "Password Reset Request";
    const emailBody = `
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail(email, emailSubject, emailBody);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
};

// Reset Password Function
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, cpassword } = req.body;

    if (!password || !cpassword) {
      return res.status(400).json({ message: "Please provide both password and confirm password" });
    }

    if (password !== cpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};
module.exports = { forgotPassword, resetPassword };
