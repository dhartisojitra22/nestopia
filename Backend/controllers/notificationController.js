require('dotenv').config();
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail"); // Import your email service

exports.sendApprovalNotification = async (req, res) => {
  try {
    const { propertyId, userEmail } = req.body;

    // Get property and user details
    const [property, user] = await Promise.all([
      Property.findById(propertyId),
      User.findOne({ email: userEmail })
    ]);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prepare email content
    const subject = 'Your Property Has Been Approved';
    const html = `
      <h2>Property Approval Notification</h2>
      <p>Dear ${user.name},</p>
      <p>We're pleased to inform you that your property listing "${property.title}" has been approved.</p>
      <p><strong>Property Details:</strong></p>
      <ul>
        <li>Title: ${property.title}</li>
        <li>Location: ${property.location}</li>
        <li>Price: $${property.price}</li>
        <li>Type: ${property.type}</li>
      </ul>
      <p>Thank you for using our platform!</p>
      <p><em>The Property Management Team</em></p>
    `;

    // Send email and create notification
    await Promise.all([
      sendEmail(userEmail, subject, html),
      User.findByIdAndUpdate(user._id, {
        $push: {
          notifications: {
            type: 'property_approved',
            message: `Your property "${property.title}" has been approved`,
            propertyId: property._id,
            read: false
          }
        }
      })
    ]);

    return res.status(200).json({ success: true, message: "Approval notification sent" });
  } catch (error) {
    console.error("Approval notification error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send approval notification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.sendRejectionNotification = async (req, res) => {
  try {
    const { propertyId, userEmail, reason } = req.body;

    // Get property and user details
    const [property, user] = await Promise.all([
      Property.findById(propertyId),
      User.findOne({ email: userEmail })
    ]);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prepare email content
    const subject = 'Your Property Listing Requires Changes';
    const html = `
      <h2>Property Rejection Notification</h2>
      <p>Dear ${user.name},</p>
      <p>We regret to inform you that your property listing "${property.title}" could not be approved.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Property Details:</strong></p>
      <ul>
        <li>Title: ${property.title}</li>
        <li>Location: ${property.location}</li>
        <li>Price: $${property.price}</li>
        <li>Type: ${property.type}</li>
      </ul>
      <p>Please review and resubmit your property.</p>
      <p><em>The Property Management Team</em></p>
    `;

    // Send email and create notification
    await Promise.all([
      sendEmail(userEmail, subject, html),
      User.findByIdAndUpdate(user._id, {
        $push: {
          notifications: {
            type: 'property_rejected',
            message: `Your property "${property.title}" was rejected: ${reason}`,
            propertyId: property._id,
            read: false
          }
        }
      })
    ]);

    return res.status(200).json({ success: true, message: "Rejection notification sent" });
  } catch (error) {
    console.error("Rejection notification error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send rejection notification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};