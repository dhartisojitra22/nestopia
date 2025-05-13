import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const AdminApprovalPage = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
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

  const handleApprove = async (propertyId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/api/properties/approve/${propertyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Property Approved!",
          text: "The property has been approved and is now visible to users.",
        });
        setPendingProperties(pendingProperties.filter(prop => prop._id !== propertyId));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Approval Failed!",
        text: error.response?.data?.message || "Failed to approve property.",
      });
    }
  };

  const handleReject = async (propertyId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://localhost:3001/api/properties/reject/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Property Rejected!",
            text: "The property has been rejected and deleted.",
            showConfirmButton: false,
            timer: 1500
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
      description: property.description,
      price: property.price,
      location: property.location
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (propertyId) => {
    try {
        const response = await axios.patch(  // Changed from PUT to PATCH
            `http://localhost:3001/api/properties/updateprop/${propertyId}`,  // Updated endpoint
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
      
      // More detailed error messages
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data.message || 
                      `Server error: ${error.response.status}`;
        
        // Handle specific status codes
        if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (error.response.status === 403) {
          errorMessage = "Forbidden - You don't have permission";
        } else if (error.response.status === 404) {
          errorMessage = "Property not found";
        }
      } else if (error.request) {
        // Request was made but no response
        errorMessage = "No response from server - check your connection";
      }
  
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        html: `
          <div>${errorMessage}</div>
          ${error.response?.data?.details ? 
            `<div class="text-muted small mt-2">${error.response.data.details}</div>` : ''
          }
        `,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (loading) return <div className="text-center mt-5">Loading pending properties...</div>;

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Pending Property Approvals</h2>
      {pendingProperties.length === 0 ? (
        <div className="alert alert-info">No properties pending approval</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Price</th>
                <th>Type</th>
                <th>Submitted By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProperties.map((property) => (
                <tr key={property._id}>
                  <td>
                    {editingId === property._id ? (
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    ) : (
                      property.title
                    )}
                  </td>
                  <td>
                    {editingId === property._id ? (
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    ) : (
                      property.location
                    )}
                  </td>
                  <td>
                    {editingId === property._id ? (
                      <input
                        type="number"
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    ) : (
                      `$${property.price}`
                    )}
                  </td>
                  <td>{property.type}</td>
                  <td>{property.adminEmail}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {editingId === property._id ? (
                        <>
                          <button
                            onClick={() => handleEditSubmit(property._id)}
                            className="btn btn-success btn-sm"
                            title="Save"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-secondary btn-sm"
                            title="Cancel"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(property)}
                            className="btn btn-primary btn-sm"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleApprove(property._id)}
                            className="btn btn-success btn-sm"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(property._id)}
                            className="btn btn-danger btn-sm"
                            title="Reject"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPage;