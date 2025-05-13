import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const { data } = await axios.get("http://localhost:3001/api/wishlist", {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });
                
                // Handle both array and object responses
                const items = data.data || data;
                setWishlist(Array.isArray(items) ? items : []);
                
            } catch (error) {
                const errorMsg = error.response?.data?.message || 
                               (error.response?.status === 401 ? 
                                "Please login again" : 
                                "Failed to fetch wishlist");
                setError(errorMsg);
                
                if (error.response?.status === 401) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchWishlist();
        } else {
            setError("Please login to view your wishlist");
            setLoading(false);
        }
    }, [token, navigate]);

    const handleRemove = async (propertyId) => {
        try {
            await axios.delete(
                `http://localhost:3001/api/wishlist/remove/${propertyId}`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            setWishlist(wishlist.filter(item => item.propertyId._id !== propertyId));
            Swal.fire("Success!", "Property removed from wishlist", "success");
        } catch (error) {
            Swal.fire(
                "Error!", 
                error.response?.data?.message || "Failed to remove from wishlist", 
                "error"
            );
        }
    };

    if (loading) return <div className="text-center py-5">Loading your wishlist...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;
    if (wishlist.length === 0) return <div className="text-center py-5">Your wishlist is empty</div>;

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">
                <FaHeart className="text-danger me-2" />
                Your Wishlist
            </h2>
            
            <div className="row">
                {wishlist.map((item) => (
                    <div key={item._id} className="col-md-4 mb-4">
                        <div 
                            className="card h-100 position-relative"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/property/${item.propertyId._id}`)}
                        >
                            <img
                                src={item.propertyId.image 
                                    ? `http://localhost:3001/${item.propertyId.image}`
                                    : "https://via.placeholder.com/300"}
                                className="card-img-top"
                                alt={item.propertyId.title}
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{item.propertyId.title}</h5>
                                <p className="card-text text-muted">
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {item.propertyId.location}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="text-success mb-0">
                                        ${item.propertyId.price?.toLocaleString()}
                                    </h6>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(item.propertyId._id);
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;