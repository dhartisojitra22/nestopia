import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSearch } from "react-icons/fa";

const AdminApprovalPage = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
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
        
        if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (error.response.status === 403) {
          errorMessage = "Forbidden - You don't have permission";
        } else if (error.response.status === 404) {
          errorMessage = "Property not found";
        }
      } else if (error.request) {
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

  const filteredProperties = pendingProperties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5">Loading pending properties...</div>;

  return (
    <div className="container-fluid px-4 py-4">
      <h2 className="mb-4">Pending Property Approvals</h2>
      
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
                    <th className="py-3 px-4">
                      <div className="d-flex align-items-center">
                        <div className="input-group ms-2" style={{ width: "200px" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <span className="input-group-text">
                            <FaSearch size={14} />
                          </span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">No matching records found</div>
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((property) => (
                      <tr key={property._id}>
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4">{property.type}</td>
                        <td className="py-3 px-4">{property.adminEmail}</td>
                        <td className="py-3 px-4">
                          <div className="d-flex gap-3">
                            {editingId === property._id ? (
                              <>
                                <button
                                  onClick={() => handleEditSubmit(property._id)}
                                  className="btn btn-link text-success p-0"
                                  title="Save"
                                >
                                  <FaCheck size={18} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="btn btn-link text-secondary p-0"
                                  title="Cancel"
                                >
                                  <FaTimes size={18} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(property)}
                                  className="btn btn-link  p-0"
                                  style={{color: 'rgb(8, 8, 131)'}}
                                  title="Edit"
                                >
                                  <FaEdit size={18} />
                                </button>
                                <button
                                  onClick={() => handleApprove(property._id)}
                                  className="btn btn-link text-success p-0"
                                  title="Approve"
                                >
                                  <FaCheck size={18} />
                                </button>
                                <button
                                  onClick={() => handleReject(property._id)}
                                  className="btn btn-link text-danger p-0"
                                  title="Reject"
                                >
                                  <FaTrash size={18} />
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