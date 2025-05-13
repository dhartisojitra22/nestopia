import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaEnvelope } from "react-icons/fa";

const AdminApprovalPage = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    price: "",
    description: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPendingProperties = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/properties/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPendingProperties(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending properties:", error);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to fetch pending properties",
        });
      }
    };

    if (token) {
      fetchPendingProperties();
    }
  }, [token]);

  const sendApprovalNotification = async (propertyId, userEmail) => {
    try {
      await axios.post(
        "http://localhost:3001/api/notifications/approve",
        { propertyId, userEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error sending approval notification:", error);
      throw error;
    }
  };

  const sendRejectionNotification = async (propertyId, userEmail, reason) => {
    try {
      await axios.post(
        "http://localhost:3001/api/notifications/reject",
        { propertyId, userEmail, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error sending rejection notification:", error);
      throw error;
    }
  };

  const handleApprove = async (propertyId, userEmail) => {
    try {
      const { value: comment } = await Swal.fire({
        title: 'Approve Property',
        input: 'textarea',
        inputLabel: 'Approval comments (optional)',
        inputPlaceholder: 'Add any comments for the user...',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Confirm Approval'
      });

      if (comment !== undefined) { // If not cancelled
        const response = await axios.patch(
          `http://localhost:3001/api/properties/approve/${propertyId}`,
          { approvalComment: comment },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          await sendApprovalNotification(propertyId, userEmail);
          
          Swal.fire({
            icon: "success",
            title: "Property Approved!",
            html: `
              <div>The property has been approved and is now visible to users.</div>
              <div class="mt-2 text-success">
                <FaEnvelope className="me-1" />
                Notification sent to the property owner.
              </div>
            `,
          });
          
          setPendingProperties(pendingProperties.filter(prop => prop._id !== propertyId));
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Approval Failed!",
        text: error.response?.data?.message || "Failed to approve property.",
      });
    }
  };

  const handleReject = async (propertyId, userEmail) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Property',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter the reason for rejecting this property...',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm Rejection',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a reason for rejection!';
        }
      }
    });

    if (isConfirmed && reason) {
      try {
        const response = await axios.patch(
          `http://localhost:3001/api/properties/reject/${propertyId}`,
          { rejectionReason: reason },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          await sendRejectionNotification(propertyId, userEmail, reason);
          
          Swal.fire({
            icon: "success",
            title: "Property Rejected!",
            html: `
              <div>The property has been rejected.</div>
              <div class="mt-2 text-success">
                <FaEnvelope className="me-1" />
                Notification with rejection reason sent to the property owner.
              </div>
            `,
          });
          
          setPendingProperties(pendingProperties.filter(prop => prop._id !== propertyId));
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Rejection Failed!",
          text: error.response?.data?.message || "Failed to reject property.",
        });
      }
    }
  };

  const handleEdit = (property) => {
    setEditingId(property._id);
    setEditForm({
      title: property.title,
      location: property.location,
      price: property.price,
      description: property.description
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (propertyId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/api/properties/updateprop/${propertyId}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Property Updated!",
          text: "The property has been successfully updated.",
          showConfirmButton: false,
          timer: 1500
        });
        setPendingProperties(pendingProperties.map(prop => 
          prop._id === propertyId ? { ...prop, ...editForm } : prop
        ));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "Failed to update property.";
      
      if (error.response) {
        errorMessage = error.response.data.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server - check your connection";
      }
  
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        text: errorMessage,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const filteredProperties = pendingProperties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.location.toLowerCase().includes(searchLower) ||
      (property.adminEmail && property.adminEmail.toLowerCase().includes(searchLower)) ||
      (property.type && property.type.toLowerCase().includes(searchLower)) ||
      (property.price && property.price.toString().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pending Property Approvals</h2>
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="input-group-text">
            <FaSearch />
          </span>
        </div>
      </div>

      {pendingProperties.length === 0 ? (
        <div className="alert alert-info">No properties pending approval</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">No matching properties found</div>
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((property) => (
                      <tr key={property._id}>
                        <td className="py-3 px-4 align-middle">
                          {editingId === property._id ? (
                            <input
                              type="text"
                              name="title"
                              value={editForm.title}
                              onChange={handleEditChange}
                              className="form-control form-control-sm"
                              required
                            />
                          ) : (
                            <div className="fw-semibold">{property.title}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 align-middle">
                          {editingId === property._id ? (
                            <input
                              type="text"
                              name="location"
                              value={editForm.location}
                              onChange={handleEditChange}
                              className="form-control form-control-sm"
                              required
                            />
                          ) : (
                            property.location
                          )}
                        </td>
                        <td className="py-3 px-4 align-middle">
                          {editingId === property._id ? (
                            <input
                              type="number"
                              name="price"
                              value={editForm.price}
                              onChange={handleEditChange}
                              className="form-control form-control-sm"
                              required
                            />
                          ) : (
                            `$${property.price}`
                          )}
                        </td>
                        <td className="py-3 px-4 align-middle">{property.type}</td>
                        <td className="py-3 px-4 align-middle">{property.adminEmail}</td>
                        <td className="py-3 px-4 align-middle">
                          <div className="d-flex gap-3">
                            {editingId === property._id ? (
                              <>
                                <button
                                  onClick={() => handleEditSubmit(property._id)}
                                  className="btn btn-sm btn-success"
                                  title="Save"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="btn btn-sm btn-secondary"
                                  title="Cancel"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(property)}
                                  className="btn btn-sm btn-primary"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleApprove(property._id, property.adminEmail)}
                                  className="btn btn-sm btn-success"
                                  title="Approve"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleReject(property._id, property.adminEmail)}
                                  className="btn btn-sm btn-danger"
                                  title="Reject"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPage;