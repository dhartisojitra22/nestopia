
const Property = require("../models/propertyModel");
// Add this at the top with your other imports
const Inquiry = require("../models/inquiryModel");
const sendEmail = require("../utils/sendEmail");
// Create a Property
const addProperty = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        const { title, description, price, location, bedrooms, bathrooms, type, listingStatus } = req.body;

        // Validate required fields
        if (!title || !price || !location || !bedrooms || !bathrooms || !type || !listingStatus) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided!",
                requiredFields: ["title", "price", "location", "bedrooms", "bathrooms", "type", "listingStatus"]
            });
        }

        const userId = req.userData?.userId;
        const adminEmail = req.userData?.email;

        if (!userId || !adminEmail) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        let imagePath = null;
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({
                    success: false,
                    message: "Only image files are allowed"
                });
            }

            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "File size exceeds 5MB limit"
                });
            }

            imagePath = `uploads/${req.file.filename}`;
        }

        const newProperty = new Property({
            title,
            description,
            price,
            location,
            bedrooms,
            bathrooms,
            type,
            listingStatus,
            adminEmail,
            userId,
            image: imagePath,
            isApproved: false
        });

        await newProperty.save();

        return res.status(201).json({
            success: true,
            message: "Property added successfully",
            property: newProperty
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// Get All Approved Properties (for users)
const getAllProperties = async (req, res) => {
    try {
        const { search, location, minPrice, maxPrice, bedrooms, sortBy, order } = req.query;
        let filter = { isApproved: true }; // Only show approved properties

        if (search) {
            filter.$or = [
                { title: new RegExp(search, "i") },
                { description: new RegExp(search, "i") },
                { location: new RegExp(search, "i") },
            ];
        }

        if (location) filter.location = new RegExp(location, "i");
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (bedrooms) filter.bedrooms = Number(bedrooms);

        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === "desc" ? -1 : 1;
        } else {
            sortOptions["createdAt"] = -1;
        }

        const properties = await Property.find(filter).sort(sortOptions);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: "Error fetching properties", error });
    }
};

// Get Pending Properties (for admin)
const getPendingProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            isApproved: false,
            isRejected: false  // Only show properties that aren't rejected
        });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending properties", error });
    }
};

// Approve Property (admin only)
// const approveProperty = async(req, res) => {
//     try {
//         const property = await Property.findByIdAndUpdate(
//             req.params.id,
//             { isApproved: true },
//             { new: true }
//         );

//         if (!property) {
//             return res.status(404).json({ message: "Property not found" });
//         }

//         res.json({ message: "Property approved successfully", property });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving property", error });
//     }
// };
// In approveProperty controller
const approveProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.json({
            message: "Property approved successfully",
            property
        });
    } catch (error) {
        res.status(500).json({
            message: "Error approving property",
            error: error.message
        });
    }
};
// Reject Property (admin only)
// In propertyController.js
const rejectProperty = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            {
                isApproved: false,
                isRejected: true,
                status: "rejected",
                rejectedAt: new Date(),
                rejectionReason: rejectionReason || "No reason provided"
            },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.json({
            message: "Property rejected successfully",
            property
        });
    } catch (error) {
        res.status(500).json({
            message: "Error rejecting property",
            error: error.message
        });
    }
};
// In propertyController.js
const getRejectedProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            isRejected: true
        }).sort({ rejectedAt: -1 });

        res.json(properties);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching rejected properties",
            error: error.message
        });
    }
};
// Get Property by ID (only approved properties for users, all for owner/admin)
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Allow access if:
        // 1. Property is approved, OR
        // 2. User is admin, OR
        // 3. User is the owner
        const isAdmin = req.userData && req.userData.role === 'admin';
        const isOwner = req.userData && req.userData.userId === property.userId.toString();

        if (!property.isApproved && !isAdmin && !isOwner) {
            return res.status(403).json({ message: "This property is pending approval" });
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: "Error fetching property", error });
    }
};

// Update Property
const updateProperty = async (req, res) => {
    try {
        const updates = req.body;
        if (req.file) {
            updates.image = `/uploads/${req.file.filename}`;
        }

        // Ensure the user field is not updated (optional)
        if (updates.user) {
            delete updates.user;
        }

        const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: "Error updating property", error });
    }
};

// Delete Property
const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.json({ message: "Property deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting property", error });
    }
};

// Get Properties by User ID
const getPropertiesByAdmin = async (req, res) => {
    try {
        // Get adminEmail from authenticated user
        const adminEmail = req.userData.email;

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const properties = await Property.find({ adminEmail })
            .sort({ createdAt: -1 }) // Sort by newest first
            .select('-__v'); // Exclude version key

        if (!properties || properties.length === 0) {
            return res.status(200).json({
                message: "No properties found for this admin",
                properties: []
            });
        }

        res.status(200).json({
            success: true,
            count: properties.length,
            properties
        });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching properties",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
const contactPropertyOwner = async (req, res) => {
    try {
      const { buyerName, buyerEmail, buyerPhone, message } = req.body;
      const propertyId = req.params.id;
  
      // Validate required fields
      if (!buyerName || !buyerEmail || !buyerPhone) {
        return res.status(400).json({
          success: false,
          message: "Name, email and phone are required fields"
        });
      }
  
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }
  
      // Check if property exists
      const property = await Property.findById(propertyId).populate('userId');
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }
  
      // Create new inquiry
      const newInquiry = new Inquiry({
        property: propertyId,
        buyerName,
        buyerEmail,
        buyerPhone,
        message
      });
  
      await newInquiry.save();
  
      // Send email to property owner
      const ownerEmail = property.userId.email;
      const ownerSubject = `New Inquiry for Your Property: ${property.title}`;
      const ownerHtml = `
        <h2>New Property Inquiry</h2>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Location:</strong> ${property.location}</p>
        <p><strong>Price:</strong> ${property.price}</p>
        <hr>
        <h3>Buyer Details:</h3>
        <p><strong>Name:</strong> ${buyerName}</p>
        <p><strong>Email:</strong> ${buyerEmail}</p>
        <p><strong>Phone:</strong> ${buyerPhone}</p>
        <p><strong>Message:</strong> ${message || "No message provided"}</p>
        <hr>
        <p>This inquiry has been saved to your property dashboard.</p>
      `;
  
      await sendEmail(ownerEmail, ownerSubject, ownerHtml);
  
      // Send confirmation to buyer
      const buyerSubject = `Your Inquiry for ${property.title}`;
      const buyerHtml = `
        <p>Thank you for your interest in the property at ${property.location}.</p>
        <p>The property owner has been notified and may contact you soon.</p>
        <p>Here are the details of your inquiry:</p>
        <ul>
          <li><strong>Property:</strong> ${property.title}</li>
          <li><strong>Location:</strong> ${property.location}</li>
          <li><strong>Your Name:</strong> ${buyerName}</li>
          <li><strong>Your Email:</strong> ${buyerEmail}</li>
          <li><strong>Your Phone:</strong> ${buyerPhone}</li>
          <li><strong>Your Message:</strong> ${message || "None"}</li>
        </ul>
      `;
  
      await sendEmail(buyerEmail, buyerSubject, buyerHtml);
  
      res.status(200).json({
        success: true,
        message: "Your inquiry has been submitted successfully"
      });
  
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit your inquiry",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
const getPropertyOwner = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('userId');

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (!property.userId) {
            return res.status(404).json({ message: "Owner not found" });
        }

        res.json({
            name: property.userId.firstName + ' ' + property.userId.lastName,
            email: property.userId.email,
            phone: property.userId.phoneNumber,
            propertiesCount: await Property.countDocuments({ userId: property.userId._id }),
            locality: property.location
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching owner details",
            error: error.message
        });
    }
};

const getPropertyInquiries = async (req, res) => {
    try {
      const propertyId = req.params.propertyId;
      
      // Verify the property exists and belongs to the user
      const property = await Property.findOne({
        _id: propertyId,
        userId: req.userData.userId
      });
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found or not authorized"
        });
      }
  
      const inquiries = await Inquiry.find({ property: propertyId })
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        inquiries
      });
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching inquiries",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
// Export all functions
module.exports = {
    addProperty,
    getAllProperties,
    getPendingProperties,
    approveProperty,
    rejectProperty,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertiesByAdmin, getRejectedProperties, contactPropertyOwner, getPropertyOwner,getPropertyInquiries
};