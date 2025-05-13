import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaTrash, FaUndo, FaSearch, FaInfoCircle } from "react-icons/fa";
import { format } from "date-fns";

const RejectedPropertiesPage = () => {
    const [rejectedProperties, setRejectedProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchRejectedProperties = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3001/api/properties/rejected",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                // Only show properties that are truly rejected
                const trulyRejected = response.data.filter(prop => prop.isRejected);
                setRejectedProperties(trulyRejected);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching rejected properties:", error);
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "Failed to fetch rejected properties",
                });
            }
        };
    
        if (token) {
            fetchRejectedProperties();
        }
    }, [token]);

    const handleRestore = async (propertyId) => {
        const result = await Swal.fire({
            title: 'Restore Property?',
            text: "This will make the property available for approval again.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, restore it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.patch(
                    `http://localhost:3001/api/properties/updateprop/${propertyId}`,
                    { 
                        isRejected: false,
                        isApproved: false,
                        status: "pending",
                        rejectionReason: null
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Property Restored!",
                        text: "The property has been moved back to pending approvals.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setRejectedProperties(rejectedProperties.filter(prop => prop._id !== propertyId));
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Restoration Failed!",
                    text: error.response?.data?.message || "Failed to restore property.",
                });
            }
        }
    };

    const showRejectionDetails = (property) => {
        Swal.fire({
            title: 'Rejection Details',
            html: `
                <div class="text-left">
                    <p><strong>Property:</strong> ${property.title}</p>
                    <p><strong>Location:</strong> ${property.location}</p>
                    <p><strong>Rejected On:</strong> ${format(new Date(property.rejectedAt), 'PPPpp')}</p>
                    <p><strong>Reason:</strong> ${property.rejectionReason || 'No reason provided'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };

    const filteredProperties = rejectedProperties.filter(property => {
        const searchLower = searchTerm.toLowerCase();
        return (
            property.title.toLowerCase().includes(searchLower) ||
            (property.location && property.location.toLowerCase().includes(searchLower)) ||
            (property.adminEmail && property.adminEmail.toLowerCase().includes(searchLower)) ||
            (property.rejectionReason && property.rejectionReason.toLowerCase().includes(searchLower))
        );
    });

    if (loading) return <div className="text-center mt-5">Loading rejected properties...</div>;

    return (
        <div className="container-fluid px-4 py-4">
            <h2 className="mb-4">Rejected Properties</h2>
            
            <div className="mb-3">
                <div className="input-group" style={{ maxWidth: "300px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search rejected properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="input-group-text">
                        <FaSearch />
                    </span>
                </div>
            </div>

            {rejectedProperties.length === 0 ? (
                <div className="alert alert-info">No rejected properties found</div>
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
                                        <th className="py-3 px-4">Submitted By</th>
                                        <th className="py-3 px-4">Rejected On</th>
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
                                                <td className="py-3 px-4">{property.title}</td>
                                                <td className="py-3 px-4">{property.location}</td>
                                                <td className="py-3 px-4">${property.price}</td>
                                                <td className="py-3 px-4">{property.adminEmail}</td>
                                                <td className="py-3 px-4">
                                                    {property.rejectedAt ? format(new Date(property.rejectedAt), 'MMM dd, yyyy') : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="d-flex gap-3">
                                                        <button
                                                            onClick={() => showRejectionDetails(property)}
                                                            className="btn btn-link text-info p-0"
                                                            title="View Details"
                                                        >
                                                            <FaInfoCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRestore(property._id)}
                                                            className="btn btn-link text-primary p-0"
                                                            title="Restore Property"
                                                        >
                                                            <FaUndo size={18} />
                                                        </button>
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

export default RejectedPropertiesPage;