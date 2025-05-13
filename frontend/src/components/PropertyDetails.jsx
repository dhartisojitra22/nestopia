import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { format } from "date-fns";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactModal, setContactModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/properties/getprop/${id}`);
        setProperty(response.data);
      } catch (error) {
        setError(error.response ? error.response.data.message : "Failed to fetch property.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleContactOwner = () => {
    // Navigate to a new page with property details
    navigate(`/contact-owner/${id}`, {
      state: {
        propertyImage: `http://localhost:3001/${property.image}`,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyPrice: property.price,
        propertyType: property.type
      }
    });
  };

  const handleAddToWishlist = async () => {
    if (!token) {
      Swal.fire("Unauthorized", "You must be logged in to add properties to the wishlist.", "warning");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/wishlist/add",
        { propertyId: id },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      Swal.fire("Success!", response.data.message, "success");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add to wishlist.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading property details...</div>;
  if (error) return <div className="text-center text-danger mt-5">Error: {error}</div>;
  if (!property) return <div className="text-center mt-5">Property not found</div>;

  // Determine property status
  const getPropertyStatus = () => {
    if (property.isRejected) {
      return {
        text: "Rejected",
        className: "alert-danger",
        canContact: false,
        canWishlist: false,
        reason: property.rejectionReason || 'No reason provided'
      };
    } else if (property.isApproved) {
      return {
        text: "Approved",
        className: "alert-success",
        canContact: true,
        canWishlist: true
      };
    } else {
      return {
        text: "Pending Approval",
        className: "alert-warning",
        canContact: false,
        canWishlist: false,
        reason: "This property is pending approval and cannot be contacted about yet."
      };
    }
  };

  const propertyStatus = getPropertyStatus();

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="p-4" style={{ border: "1px solid #ccc", borderRadius: "10px", width: "50%", textAlign: "center", background:"white" }}>
        <img
          src={`http://localhost:3001/${property.image}` || "https://via.placeholder.com/500"}
          alt={property.title}
          className="img-fluid rounded mb-3"
          style={{ width: "100%", height: "350px", objectFit: "cover" }}
        />

        <h2 className="text-primary">{property.title}</h2>
        <p className="text-muted">
          <i className="fa fa-map-marker-alt"></i> {property.location}
        </p>
        <h4 className="text-success mb-3">
          ${property.price} {property.listingStatus === 'For Rent' ? '/month' : ''}
        </h4>
        <p className="text-muted">{property.description}</p>
        
        <div className="row text-center">
          <div className="col-6 border-end">
            <p><strong>🏠 Type:</strong> {property.type}</p>
            <p><strong>🛏️ Bedrooms:</strong> {property.bedrooms}</p>
            <p><strong>🏷️ Listing Type:</strong> {property.listingStatus}</p>
          </div>
          <div className="col-6">
            <p><strong>🛁 Bathrooms:</strong> {property.bathrooms}</p>
            <p><strong>📏 Size:</strong> {property.sqft} sq.ft</p>
            <p><strong>Status:</strong> 
              <span className={`badge ${propertyStatus.className} ms-2`}>
                {propertyStatus.text}
              </span>
            </p>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button 
            className="btn btn-primary"
            onClick={handleContactOwner}
            disabled={!propertyStatus.canContact}
          >
            <i className="fa fa-envelope"></i> Contact Property Owner
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleAddToWishlist}
            disabled={!propertyStatus.canWishlist || !token}
          >
            <i className="fa fa-heart"></i> Save Property
          </button>
        </div>

        {!propertyStatus.canContact && (
          <div className={`mt-3 alert ${propertyStatus.className}`}>
            {propertyStatus.reason || 'This property cannot be contacted about at this time.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;