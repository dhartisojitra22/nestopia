const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const Property = require('../models/propertyModel');
const Booking = require("../models/bookingModel"); 
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const sendEmail = require('../utils/sendEmail');
// Add this to your bookingRoutes.js
router.get("/check-availability/:id", bookingController.checkAvailability);

// Create booking
router.post("/", authenticate, bookingController.createBooking);
// Add this to your bookingRoutes.js
router.get("/my-bookings", authenticate, bookingController.getUserBookings);
router.patch("/:id/status", authenticate, bookingController.updateBookingStatus);
// Example backend route (Node.js/Express)
router.get('/:id', authenticate, async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('propertyId')
        .populate('userId');
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      res.json({ data: booking });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


// Get bookings for a specific property
router.get("/property/:id", authenticate, bookingController.getPropertyBookings);
// Get all bookings (admin only)
router.get("/admin", authenticate, authorize(['admin']), bookingController.getAllBookings);

// Update booking status (admin only)
router.patch("/:id/status", authenticate, authorize(['admin']), bookingController.updateBookingStatus);

// Delete booking (admin only)
router.delete("/:id", authenticate, authorize(['admin']), bookingController.deleteBooking);

router.post('/:id/notify', authenticate, async (req, res) => {
    // Start transaction logging
    const transactionId = `txn_${Date.now()}`;
    console.log(`[${transactionId}] Starting notification process for booking: ${req.params.id}`);
    
    try {
        // Validate request body
        const { status } = req.body;
        if (!status || !['confirmed', 'cancelled'].includes(status)) {
            console.error(`[${transactionId}] Invalid status: ${status}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
                error: 'INVALID_STATUS',
                validStatuses: ['confirmed', 'cancelled'],
                transactionId
            });
        }

        // Find booking with detailed population
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'userId',
                select: 'firstName lastName email phoneNumber',
                model: 'User'
            })
            .populate({
                path: 'propertyId',
                select: 'title owner location',
                model: 'Property'
            })
            .lean();

        if (!booking) {
            console.error(`[${transactionId}] Booking not found`);
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND',
                transactionId
            });
        }

        // Verify property ownership
        let propertyOwner = booking.propertyId?.owner;
        if (!propertyOwner) {
            // Fallback: Fetch fresh property data
            const freshProperty = await Property.findById(booking.propertyId?._id).select('owner').lean();
            if (!freshProperty) {
                console.error(`[${transactionId}] Associated property not found`);
                return res.status(400).json({
                    success: false,
                    message: 'Associated property not found',
                    error: 'PROPERTY_NOT_FOUND',
                    transactionId
                });
            }
            propertyOwner = freshProperty.owner;
        }

        if (propertyOwner.toString() !== req.user.id) {
            console.error(`[${transactionId}] Unauthorized access attempt by user: ${req.user.id}`);
            return res.status(403).json({
                success: false,
                message: 'Not authorized to manage this booking',
                error: 'UNAUTHORIZED_ACCESS',
                requiredRole: 'property_owner',
                transactionId
            });
        }

        // Validate user information
        if (!booking.userId) {
            console.error(`[${transactionId}] No user associated with booking`);
            return res.status(400).json({
                success: false,
                message: 'No user associated with this booking',
                error: 'MISSING_USER_REFERENCE',
                transactionId
            });
        }

        // Validate email address exists
        if (!booking.userId.email) {
            console.error(`[${transactionId}] Missing user email`);
            return res.status(400).json({
                success: false,
                message: 'Cannot send notification - user email is missing',
                error: 'MISSING_USER_EMAIL',
                transactionId,
                actionRequired: {
                    description: 'Please contact the user directly',
                    contactInfo: {
                        phone: booking.userId.phoneNumber || 'Not available',
                        name: `${booking.userId.firstName || ''} ${booking.userId.lastName || ''}`.trim() || 'Customer'
                    }
                }
            });
        }

        // Prepare email content with fallbacks
        const action = status === 'confirmed' ? 'approved' : 'rejected';
        const emailData = {
            propertyTitle: booking.propertyId?.title || 'your booked property',
            userName: booking.userId.firstName || 'Customer',
            startDate: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'unspecified date',
            endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'unspecified date',
            totalPrice: booking.totalPrice ? `$${booking.totalPrice.toFixed(2)}` : 'amount not specified',
            location: booking.propertyId?.location || 'unknown location',
            ownerEmail: req.user.email || 'property owner'
        };

        const emailSubject = `Your booking has been ${action}`;
        const emailHtml = generateEmailTemplate(emailData, status, action);

        // Attempt to send email with retry logic
        let emailSent = false;
        let emailError = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`[${transactionId}] Email attempt ${attempt}`);
                await sendEmail(booking.userId.email, emailSubject, emailHtml);
                
console.log(`[${transactionId}] Email sent:`, emailInfo.messageId);
                emailSent = true;
                break;
            } catch (err) {
                emailError = err;
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        if (!emailSent) {
            console.error(`[${transactionId}] All email attempts failed:`, emailError);
            throw {
                type: 'EMAIL_FAILURE',
                error: emailError,
                message: 'All email delivery attempts failed'
            };
        }

        // Update booking status only after successful notification
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        console.log(`[${transactionId}] Successfully processed booking notification`);
        return res.json({
            success: true,
            message: `Booking ${action} and notification sent successfully`,
            data: {
                bookingId: updatedBooking._id,
                status: updatedBooking.status,
                notificationSent: true,
                timestamp: new Date()
            },
            transactionId
        });

    } catch (error) {
        console.error(`[${transactionId}] Processing error:`, error);

        // Handle different error types
        if (error.type === 'EMAIL_FAILURE') {
            return res.status(400).json({
                success: false,
                message: 'Booking status not updated - failed to send notification',
                error: 'NOTIFICATION_FAILED',
                transactionId,
                actionRequired: {
                    description: 'Please fix notification service issues',
                    contact: {
                        email: booking?.userId?.email || 'Not available',
                        phone: booking?.userId?.phoneNumber || 'Not available'
                    }
                }
            });
        }

        // Handle database errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error updating booking',
                error: 'VALIDATION_ERROR',
                details: error.errors,
                transactionId
            });
        }

        // Handle other unexpected errors
        return res.status(500).json({
            success: false,
            message: 'Unexpected error processing booking notification',
            error: error.message,
            errorType: error.name || 'SERVER_ERROR',
            transactionId,
            supportContact: 'support@yourdomain.com',
            timestamp: new Date()
        });
    }
});

// Helper function for email template
function generateEmailTemplate(data, status, action) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Booking ${action}</h2>
            <p>Dear ${data.userName},</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p>Your booking for <strong>${data.propertyTitle}</strong> in ${data.location} has been ${action}.</p>
                <p>Status: <span style="font-weight: bold; color: ${
                    status === 'confirmed' ? '#28a745' : '#dc3545'
                }">${status}</span></p>
            </div>

            <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px;">Booking Details</h3>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 8px;">📅 Dates: ${data.startDate} to ${data.endDate}</li>
                <li style="margin-bottom: 8px;">💰 Total Amount: ${data.totalPrice}</li>
            </ul>

            ${status === 'confirmed' ? `
            <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4 style="color: #004085; margin-top: 0;">Next Steps</h4>
                <p>Please prepare for your stay at ${data.propertyTitle}.</p>
                <p>If you have any questions, contact the property owner at ${data.ownerEmail}.</p>
            </div>
            ` : `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p>If you believe this is a mistake, please contact the property owner at ${data.ownerEmail}.</p>
            </div>
            `}

            <p style="font-size: 0.9em; color: #6c757d;">Thank you for using our service!</p>
        </div>
    `;
}


module.exports = router;