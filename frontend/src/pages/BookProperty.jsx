import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addMonths } from "date-fns";

const BookProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: addMonths(new Date(), 1),
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/properties/getprop/${id}`
        );

        if (response.data.listingStatus !== "For Rent") {
          throw new Error("This property is not available for rent");
        }

        setProperty(response.data);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    const calculatePriceAndCheckAvailability = async () => {
      if (property && formData.startDate && formData.endDate) {
        // Validate dates first
        if (formData.endDate <= formData.startDate) {
          setIsAvailable(false);
          setAvailabilityMessage("End date must be after start date");
          return;
        }

        const diffTime = Math.abs(formData.endDate - formData.startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
          setIsAvailable(false);
          setAvailabilityMessage("Minimum rental period is 30 days");
          return;
        }

        // Calculate duration in months (minimum 1 month)
        const diffMonths = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)));

        // Calculate prices
        const total = diffMonths * parseFloat(property.price);
        const deposit = total * 0.1; // 10% deposit

        setTotalPrice(total);
        setDepositAmount(deposit.toFixed(2)); // Format to 2 decimal places

        // Check Availability
        try {
          const res = await axios.get(
            `http://localhost:3001/api/bookings/check-availability/${id}`,
            {
              params: {
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString(),
              },
            }
          );

          setIsAvailable(res.data.isAvailable);
          setAvailabilityMessage(res.data.message);

        } catch (err) {
          console.error("Availability check failed:", err);
          setIsAvailable(false);
          setAvailabilityMessage("Failed to check availability. Please try again.");
        }
      }
    };

    calculatePriceAndCheckAvailability();
  }, [formData.startDate, formData.endDate, property, id]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData({
      ...formData,
      startDate: start || new Date(),
      endDate: end || addMonths(new Date(), 1),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !user) {
      Swal.fire(
        "Unauthorized",
        "You must be logged in to book a property.",
        "warning"
      );
      return;
    }

    if (!isAvailable) {
      Swal.fire(
        "Unavailable",
        availabilityMessage || "This property is not available for the selected dates.",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        propertyId: id,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        specialRequests: formData.specialRequests,
      };

      const response = await axios.post(
        "http://localhost:3001/api/bookings",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // In your handleSubmit function, update the success callback:
      Swal.fire({
        title: "Booking Confirmed!",
        text: "Your rental has been successfully booked.",
        icon: "success",
        confirmButtonText: "View My Bookings",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/my-bookings");
        }
      });
    } catch (error) {
      console.error("Booking error:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create booking. Please try again later.";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPropertyStatus = () => {
    if (property?.isRejected) {
      return {
        text: "Rejected",
        description: property.rejectionReason || "This property cannot be booked",
        className: "alert-danger",
        canBook: false,
      };
    } else if (property?.isApproved) {
      return {
        text: "Approved",
        description: "This property is available for booking",
        className: "alert-success",
        canBook: true,
      };
    } else {
      return {
        text: "Pending Approval",
        description: "This property is awaiting admin approval",
        className: "alert-warning",
        canBook: false,
      };
    }
  };

  if (loading)
    return <div className="text-center mt-5">Loading property details...</div>;
  if (error)
    return (
      <div className="text-center text-danger mt-5">Error: {error}</div>
    );
  if (!property)
    return <div className="text-center mt-5">Property not found</div>;

  const propertyStatus = getPropertyStatus();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="mb-0" style={{ color: "whitesmoke" }}>
                Book Rental: {property.title}
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* Property Info */}
                <div className="col-md-6">
                  <img
                    src={
                      `http://localhost:3001/${property.image}` ||
                      "https://via.placeholder.com/500"
                    }
                    alt={property.title}
                    className="img-fluid rounded mb-3"
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                    }}
                  />
                  <h4 className="text-success mb-2">
                    ${property.price}{" "}
                    <small className="text-muted">/ month</small>
                  </h4>
                  <p className="text-muted mb-1">
                    <i className="fa fa-map-marker-alt me-1"></i>{" "}
                    {property.location}
                  </p>
                  <p className="mb-1">
                    <strong>Bedrooms:</strong> {property.bedrooms}
                  </p>
                  <p className="mb-1">
                    <strong>Bathrooms:</strong> {property.bathrooms}
                  </p>
                  <div className={`alert ${propertyStatus.className} mt-3`}>
                    <strong>{propertyStatus.text}:</strong>{" "}
                    {propertyStatus.description}
                  </div>
                </div>

                {/* Booking Form */}
                <div className="col-md-6">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="dates" className="form-label">
                        Rental Period
                      </label>
                      <DatePicker
                        id="dates"
                        selected={formData.startDate}
                        onChange={handleDateChange}
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        selectsRange
                        minDate={new Date()}
                        className="form-control"
                        required
                        disabled={!propertyStatus.canBook}
                        dateFormat="MM/dd/yyyy"
                      />
                      <div className="form-text">
                        Select start and end dates (minimum 30 days)
                      </div>
                      {!isAvailable && (
                        <div className="alert alert-warning mt-2">
                          {availabilityMessage}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="specialRequests" className="form-label">
                        Special Requests
                      </label>
                      <textarea
                        className="form-control"
                        id="specialRequests"
                        name="specialRequests"
                        rows="3"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or questions..."
                        disabled={!propertyStatus.canBook}
                      />
                    </div>

                    {/* Summary */}
                    <div className="mb-4 p-3 bg-light rounded shadow-sm">
                      <h5 className="mb-3">Rental Summary</h5>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Monthly Rent:</span>
                        <span>${property.price}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Duration:</span>
                        <span>
                          {Math.ceil(
                            (formData.endDate - formData.startDate) /
                            (1000 * 60 * 60 * 24 * 30)
                          )}{" "}
                          months
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Deposit (10%):</span>
                        <span>${depositAmount}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total Amount:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={
                        isSubmitting || !propertyStatus.canBook || !isAvailable
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span className="ms-2">Processing...</span>
                        </>
                      ) : propertyStatus.canBook ? (
                        "Confirm Rental"
                      ) : (
                        propertyStatus.text
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookProperty;