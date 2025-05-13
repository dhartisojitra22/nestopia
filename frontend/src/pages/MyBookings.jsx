import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { format } from "date-fns";

const MyBookings = () => {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setError("You must be logged in to view bookings");
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(
          "http://localhost:3001/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log("Bookings response:", response.data);
  
        const fetchedBookings = Array.isArray(response.data.data)
          ? response.data.data
          : [];
  
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookings();
  }, [token]);
  
  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `http://localhost:3001/api/bookings/${bookingId}/status`,
          { status: "cancelled" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedBookings = bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        );
        setBookings(updatedBookings);

        Swal.fire("Cancelled!", "Your booking has been cancelled.", "success");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to cancel booking",
          "error"
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Error: {error}
          {!token && (
            <button
              className="btn btn-link"
              onClick={() => navigate("/login")}
            >
              Login here
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          You have no bookings yet.
          <button
            className="btn btn-link"
            onClick={() => navigate("/properties")}
          >
            Browse properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">My Bookings</h3>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Location</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(bookings) &&
                      bookings.map((booking) => {
                        if (!booking || !booking.propertyId) return null;

                        const startDate = booking.startDate
                          ? new Date(booking.startDate)
                          : null;
                        const endDate = booking.endDate
                          ? new Date(booking.endDate)
                          : null;
                        const durationDays =
                          startDate && endDate
                            ? Math.ceil(
                                (endDate - startDate) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0;

                        return (
                          <tr key={booking._id || Math.random()}>
                            <td>
                              <div
                                className="d-flex align-items-center"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  navigate(
                                    `/properties/${booking.propertyId._id}`
                                  )
                                }
                              >
                                <img
                                  src={
                                    booking.propertyId.image
                                      ? `http://localhost:3001/${booking.propertyId.image}`
                                      : "https://via.placeholder.com/100"
                                  }
                                  alt={
                                    booking.propertyId.title || "Property"
                                  }
                                  className="img-thumbnail me-3"
                                  style={{ width: "80px", height: "60px" }}
                                />
                                <div>
                                  <h6 className="mb-0">
                                    {booking.propertyId.title ||
                                      "Untitled Property"}
                                  </h6>
                                  <small className="text-muted">
                                    {booking.propertyId.bedrooms || 0} beds,{" "}
                                    {booking.propertyId.bathrooms || 0} baths
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              {booking.propertyId.location ||
                                "Location not specified"}
                            </td>
                            <td>
                              {startDate
                                ? format(startDate, "MMM d, yyyy")
                                : "N/A"}{" "}
                              -{" "}
                              {endDate
                                ? format(endDate, "MMM d, yyyy")
                                : "N/A"}
                              <br />
                              <small className="text-muted">
                                {durationDays} days
                              </small>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  booking.status === "confirmed"
                                    ? "bg-success"
                                    : booking.status === "pending"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {booking.status || "unknown"}
                              </span>
                            </td>
                            <td>
                              ${(booking.totalPrice || 0).toFixed(2)}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() =>
                                  navigate(`/bookings/${booking._id}`)
                                }
                              >
                                Details
                              </button>
                              {booking.status === "pending" && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleCancelBooking(booking._id)
                                  }
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
