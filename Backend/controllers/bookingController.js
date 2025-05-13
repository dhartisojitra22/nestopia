const Booking = require("../models/bookingModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// Calculate deposit (1 month's rent)
const calculateDeposit = (monthlyPrice) => monthlyPrice;

// Create booking
exports.createBooking = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User data from token:", req.userData);

    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed"
      });
    }

    const { propertyId, startDate, endDate, specialRequests = "" } = req.body;
    const userId = req.userData.userId;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (propertyId, startDate, endDate)"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ Fix: Use firstName + lastName and phoneNumber from your schema
    const fullName = `${user.firstName} ${user.lastName}`;
    if (!user.firstName || !user.lastName || !user.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Booking validation failed: first name, last name, and phone number are required in user profile."
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      return res.status(400).json({
        success: false,
        message: "Minimum rental period is 30 days"
      });
    }

    if (property.listingStatus !== "For Rent") {
      return res.status(400).json({
        success: false,
        message: "This property is not available for rent"
      });
    }

    if (!property.isApproved || property.isRejected) {
      return res.status(400).json({
        success: false,
        message: property.isRejected
          ? `This property has been rejected. ${property.rejectionReason || ""}`
          : "This property is not approved for booking yet"
      });
    }

    const overlappingBookings = await Booking.find({
      propertyId,
      status: { $in: ["pending", "confirmed"] },
      $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This property is already booked for the selected dates"
      });
    }

    const durationMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const totalPrice = durationMonths * property.price;
    const depositAmount = calculateDeposit(property.price);

    const newBooking = new Booking({
      propertyId,
      userId,
      startDate: start,
      endDate: end,
      name: fullName,
      email: user.email,
      phone: user.phoneNumber,
      monthlyPrice: property.price,
      totalPrice,
      depositAmount,
      specialRequests,
      status: "pending",
      paymentStatus: "unpaid"
    });

    await newBooking.save();

    const propertyOwner = await User.findById(property.owner);
    if (propertyOwner?.email) {
      await sendEmail(
        propertyOwner.email,
        "New Booking Request",
        `New booking request received for "${property.title}" from ${fullName}.`
      );
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message
    });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    if (!req.userData || req.userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const bookings = await Booking.find()
      .populate('propertyId', 'title location price')
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    if (!req.userData || req.userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('propertyId', 'title location price')
      .populate('userId', 'firstName lastName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: booking
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message
    });
  }
};

// Delete booking (admin only)
exports.deleteBooking = async (req, res) => {
  try {
    if (!req.userData || req.userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed"
      });
    }

    const bookings = await Booking.find({ userId: req.userData.userId })
      .populate('propertyId', 'title location price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'title location price')
      .populate('userId', 'firstName lastName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (
      booking.userId._id.toString() !== req.userData.userId.toString() &&
      req.userData.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this booking"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message
    });
  }
};

// Add this to your bookingController.js

// Check property availability
exports.checkAvailability = async (req, res) => {
  try {
    console.log("Received availability check for:", req.params.id);
    console.log("With dates:", req.query.startDate, req.query.endDate);
    
    // Change from propertyId to id to match the route parameter
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (property.listingStatus !== "For Rent") {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: "This property is not available for rent"
      });
    }

    if (!property.isApproved || property.isRejected) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: property.isRejected
          ? `This property has been rejected: ${property.rejectionReason || ""}`
          : "This property is not approved for booking yet"
      });
    }

    const overlappingBookings = await Booking.find({
      propertyId: id,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start }
    }]
    });

    const isAvailable = overlappingBookings.length === 0;

    res.status(200).json({
      success: true,
      isAvailable,
      message: isAvailable 
        ? "Property is available for the selected dates"
        : "Property is not available for the selected dates"
    });

  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check availability",
      error: error.message
    });
  }
};

// Add this to your existing controller
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userData.userId })
      .populate("propertyId", "title location bedrooms bathrooms image price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.userData.userId },
      { status },
      { new: true }
    ).populate("propertyId", "title location");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

// Get bookings for a specific property (property owner only)
exports.getPropertyBookings = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First verify the property exists and belongs to the requesting user
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check if the requesting user is the owner or admin
    const isAdmin = req.userData?.role === 'admin';
    const isOwner = req.userData?.userId === property.userId.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view bookings for this property"
      });
    }

    // Get all bookings for this property
    const bookings = await Booking.find({ propertyId: id })
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching property bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property bookings",
      error: error.message
    });
  }
};