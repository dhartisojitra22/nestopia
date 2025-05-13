import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { format } from "date-fns";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/bookings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBooking(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, token]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Error: {error}
          <button
            className="btn btn-link"
            onClick={() => navigate("/my-bookings")}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          Booking not found.
          <button
            className="btn btn-link"
            onClick={() => navigate("/my-bookings")}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const startDate = booking.startDate ? new Date(booking.startDate) : null;
  const endDate = booking.endDate ? new Date(booking.endDate) : null;
  const durationDays = startDate && endDate
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Booking Details</h3>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Property Information</h5>
                  <img
                    src={
                      booking.propertyId.image
                        ? `http://localhost:3001/${booking.propertyId.image}`
                        : "https://via.placeholder.com/400"
                    }
                    alt={booking.propertyId.title || "Property"}
                    className="img-fluid rounded mb-3"
                  />
                  <h4>{booking.propertyId.title || "Untitled Property"}</h4>
                  <p>
                    <i className="fas fa-map-marker-alt"></i>{" "}
                    {booking.propertyId.location || "Location not specified"}
                  </p>
                  <p>
                    {booking.propertyId.bedrooms || 0} beds,{" "}
                    {booking.propertyId.bathrooms || 0} baths
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>Booking Information</h5>
                  <div className="mb-3">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        booking.status === "confirmed"
                          ? "bg-success"
                          : booking.status === "pending"
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Dates:</strong>{" "}
                    {startDate ? format(startDate, "MMM d, yyyy") : "N/A"} to{" "}
                    {endDate ? format(endDate, "MMM d, yyyy") : "N/A"}
                    <br />
                    <small>({durationDays} days)</small>
                  </div>
                  <div className="mb-3">
                    <strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}
                  </div>
                  <div className="mb-3">
                    <strong>Booked On:</strong>{" "}
                    {format(new Date(booking.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/my-bookings")}
                >
                  Back to My Bookings
                </button>
                {booking.status === "pending" && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      // Implement cancel functionality here
                      Swal.fire({
                        title: "Cancel Booking",
                        text: "Are you sure you want to cancel this booking?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, cancel",
                        cancelButtonText: "No, keep it",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          // Call API to cancel booking
                          navigate("/my-bookings");
                        }
                      });
                    }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;