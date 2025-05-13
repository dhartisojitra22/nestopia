import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const PropertyOrders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch property details
        const propertyRes = await axios.get(
          `http://localhost:3001/api/properties/getprop/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setProperty(propertyRes.data);

        // Fetch bookings for this property
        const bookingsRes = await axios.get(
          `http://localhost:3001/api/bookings/property/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setBookings(bookingsRes.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        
        if (err.response?.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You are not authorized to view orders for this property',
          }).then(() => navigate('/my-properties'));
        }
      }
    };

    if (token) {
      fetchData();
    }
  }, [id, token, navigate]);
  const updateBookingStatus = async (bookingId, status) => {
    try {
        const response = await axios.post(
            `/api/bookings/${bookingId}/notify`,
            { status },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        // Handle success
        if (response.data.success) {
            // Update UI state
            setBookings(prev => prev.map(b => 
                b._id === bookingId ? { ...b, status } : b
            ));
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Status updated successfully',
                timer: 3000
            });
            return true;
        }

    } catch (error) {
        let errorMessage = 'Failed to update booking status';
        let errorDetails = '';
        
        if (error.response) {
            // Handle specific error cases
            switch (error.response.data.error) {
                case 'BOOKING_NOT_FOUND':
                    errorMessage = 'Booking Not Found';
                    errorDetails = 'The booking reference is invalid or the booking was deleted';
                    break;
                
                case 'INVALID_ID_FORMAT':
                    errorMessage = 'Invalid Booking ID';
                    errorDetails = 'The booking reference format is incorrect';
                    break;
                
                case 'UNAUTHORIZED_ACCESS':
                    errorMessage = 'Access Denied';
                    errorDetails = 'You are not authorized to modify this booking';
                    break;
                
                default:
                    errorMessage = error.response.data.message || errorMessage;
                    errorDetails = error.response.data.details || '';
            }
        } else if (error.request) {
            errorMessage = 'Network Error';
            errorDetails = 'Could not connect to the server';
        } else {
            errorMessage = 'Application Error';
            errorDetails = error.message;
        }

        // Show error to user
        await Swal.fire({
            icon: 'error',
            title: errorMessage,
            html: `
                <div class="text-start">
                    <p>${errorDetails}</p>
                    ${error.response?.data?.solution ? 
                        `<p class="mt-2"><strong>Solution:</strong> ${error.response.data.solution}</p>` : ''}
                    <hr class="my-3">
                    <p class="text-muted small">
                        Reference: ${bookingId}<br>
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            `,
            confirmButtonText: 'OK',
            footer: 'Please contact support if the problem persists'
        });
        
        return false;
    }
};
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading property orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => navigate('/my-properties')}
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Orders for {property?.title}</h2>
          <p className="text-muted mb-0">
            <i className="fas fa-map-marker-alt me-2"></i>
            {property?.location}
          </p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/my-properties')}
        >
          <i className="fas fa-arrow-left me-2"></i>Back to Properties
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <h4>No orders found for this property</h4>
          <p className="text-muted">You'll see orders here when customers book your property</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const startDate = booking.startDate ? new Date(booking.startDate) : null;
                    const endDate = booking.endDate ? new Date(booking.endDate) : null;
                    const durationDays = startDate && endDate 
                      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <tr key={booking._id}>
                        <td>
                          {booking.userId ? (
                            <>
                              <strong>{booking.userId.firstName} {booking.userId.lastName}</strong>
                              <div className="text-muted small">{booking.userId.email}</div>
                              <div className="text-muted small">{booking.userId.phoneNumber}</div>
                            </>
                          ) : (
                            'Customer information not available'
                          )}
                        </td>
                        <td>
                          {startDate ? format(startDate, 'MMM d, yyyy') : 'N/A'} - {' '}
                          {endDate ? format(endDate, 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td>{durationDays} days</td>
                        <td>${booking.totalPrice?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`badge ${
                            booking.status === 'confirmed' ? 'bg-success' :
                            booking.status === 'pending' ? 'bg-warning' :
                            booking.status === 'cancelled' ? 'bg-danger' :
                            'bg-secondary'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {booking.status === 'pending' && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              >
                                Reject
                              </button>
                            </div>
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
      )}
    </div>
  );
};

export default PropertyOrders;