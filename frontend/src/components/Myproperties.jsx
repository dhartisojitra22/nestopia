import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const MyProperties = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [inquiries, setInquiries] = useState({});
  const [showInquiries, setShowInquiries] = useState({});

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (!user?.email || !token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(
          'http://localhost:3001/api/properties/getbyadmin',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        setProperties(response.data.properties || []);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setLoading(false);
        setError(err.response?.data?.message || err.message || 'Failed to fetch properties');

        if (err.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Please login again',
          }).then(() => navigate('/login'));
        }
      }
    };

    fetchProperties();
  }, [user, token, navigate]);

  const fetchInquiries = async (propertyId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/properties/inquiries/property/${propertyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setInquiries(prev => ({
        ...prev,
        [propertyId]: response.data.inquiries || []
      }));
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to fetch inquiries for this property'
      });
    }
  };

  const toggleInquiries = (propertyId) => {
    if (!inquiries[propertyId]) {
      fetchInquiries(propertyId);
    }
    setShowInquiries(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        setDeletingId(id);
        await axios.delete(
          `http://localhost:3001/api/properties/deleteprop/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setProperties(prev => prev.filter(p => p._id !== id));
        await Swal.fire('Deleted!', 'Property deleted successfully.', 'success');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to delete property'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/editprop/${id}`);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5" style={{ minHeight: '70vh' }}>
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-primary"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt me-2"></i>Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ minHeight: '70vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Properties</h2>
        <Link to="/addproperty" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-5">
          <h4>You haven't added any properties yet</h4>
          <Link to="/addproperty" className="btn btn-primary mt-3">
            <i className="fas fa-plus me-2"></i>Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="row">
          {properties.map((property) => (
            <div key={property._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img
                    src={property.image ? `http://localhost:3001/${property.image}` : '/assets/img/no-image.jpg'}
                    className="card-img-top"
                    alt={property.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/assets/img/no-image.jpg';
                    }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className={`badge ${property.isApproved ? 'bg-success' :
                        property.isRejected ? 'bg-danger' : 'bg-warning'
                      }`}>
                      {property.isApproved ? 'Approved' : 
                        property.isRejected ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{property.title}</h5>
                  <p className="card-text text-muted">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {property.location}
                  </p>
                  <div className="d-flex justify-content-between mb-2">
                    <span><i className="fas fa-bed me-2"></i>{property.bedrooms} Beds</span>
                    <span><i className="fas fa-bath me-2"></i>{property.bathrooms} Baths</span>
                    <span><i className="fas fa-tag me-2"></i>${property.price}</span>
                  </div>
                  {property.isApproved === false && property.rejectionReason && (
                    <div className="alert alert-danger p-2 mb-2">
                      <small>
                        <strong>Rejection Reason:</strong> {property.rejectionReason}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex flex-column">
                    <div className="d-flex justify-content-between mb-2">
                      {property.isApproved && (
                        <button
                          onClick={() => handleEdit(property._id)}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          <i className="fas fa-edit me-1"></i>Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="btn btn-sm btn-outline-danger"
                        disabled={deletingId === property._id}
                      >
                        {deletingId === property._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-trash me-1"></i>Delete
                          </>
                        )}
                      </button>
                    </div>
                    
                    {property.isApproved && (
                      <button
                        onClick={() => toggleInquiries(property._id)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="fas fa-envelope me-1"></i>
                        {showInquiries[property._id] ? 'Hide Inquiries' : 'View Inquiries'}
                        {inquiries[property._id]?.length > 0 && (
                          <span className="badge bg-secondary ms-2">
                            {inquiries[property._id].length}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {showInquiries[property._id] && (
                    <div className="mt-3">
                      <h6 className="text-muted">Contact Inquiries:</h6>
                      {inquiries[property._id]?.length > 0 ? (
                        <div className="list-group">
                          {inquiries[property._id].map((inquiry, index) => (
                            <div key={index} className="list-group-item small p-2 mb-1">
                              <div className="d-flex justify-content-between">
                                <strong>{inquiry.buyerName}</strong>
                                <small>{new Date(inquiry.createdAt).toLocaleDateString()}</small>
                              </div>
                              <div>
                                <small className="text-muted">Email: {inquiry.buyerEmail}</small>
                              </div>
                              <div>
                                <small className="text-muted">Phone: {inquiry.buyerPhone}</small>
                              </div>
                              {inquiry.message && (
                                <div className="mt-1">
                                  <small>Message: {inquiry.message}</small>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info p-2 mb-0">
                          <small>No inquiries yet for this property</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;