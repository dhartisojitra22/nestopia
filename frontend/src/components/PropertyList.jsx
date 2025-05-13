
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/properties/getallprop");
                setProperties(response.data);
                setFilteredProperties(response.data);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch properties");
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        if (!searchKeyword) {
            setFilteredProperties(properties);
            return;
        }

        const filtered = properties.filter((property) =>
            ["title", "location", "type"].some((key) =>
                property[key]?.toLowerCase().includes(searchKeyword.toLowerCase())
            )
        );
        setFilteredProperties(filtered);
    }, [searchKeyword, properties]);

    if (loading) return <div>Loading properties...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="row mb-5">
                    <div className="col-md-6 offset-md-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title, location, or type..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="row g-4">
                    {filteredProperties.map((property) => (
                        <div className="col-lg-4 col-md-6" key={property._id}>
                            <div className="property-item rounded overflow-hidden">
                                <div className="position-relative overflow-hidden">
                                    <a href="#">
                                        <img
                                            className="img-fluid"
                                            src={`http://localhost:3001/${property.image}`}
                                            alt={property.title}
                                            style={{ height: "250px", width: "100%" }}
                                        />
                                    </a>
                                    <div className="bg-primary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">
                                        {property.listingStatus}
                                    </div>
                                    <div className="bg-white rounded-top text-primary position-absolute start-0 bottom-0 mx-4 pt-1 px-3">
                                        {property.type || "Apartment"}
                                    </div>
                                </div>
                                <div className="p-4 pb-0">
                                    <h5 className="text-primary mb-3">${property.price}</h5>
                                    <a className="d-block h5 mb-2" href="#">{property.title}</a>
                                    <p>
                                        <i className="fa fa-map-marker-alt text-primary me-2"></i>
                                        {property.location}
                                    </p>
                                </div>
                                <div className="d-flex border-top">
                                    <small className="flex-fill text-center border-end py-2">
                                        <i className="fa fa-ruler-combined text-primary me-2"></i>
                                        {property.sqft || "1000 Sqft"}
                                    </small>
                                    <small className="flex-fill text-center border-end py-2">
                                        <i className="fa fa-bed text-primary me-2"></i>
                                        {property.bedrooms} Bed
                                    </small>
                                    <small className="flex-fill text-center py-2">
                                        <i className="fa fa-bath text-primary me-2"></i>
                                        {property.baths || 2} Bath
                                    </small>
                                </div>
                                <div className="p-3 text-center">
                                    <button className="btn btn-outline-primary" onClick={() => navigate(`/property/${property._id}`)}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PropertyList;