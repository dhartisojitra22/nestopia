import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
    { id: 1, name: "Apartment", img: "/assets/img/icon-apartment.png", properties: 123, delay: "0.1s" },
    { id: 2, name: "Villa", img: "/assets/img/icon-villa.png", properties: 98, delay: "0.3s" },
    { id: 3, name: "House", img: "/assets/img/icon-house.png", properties: 85, delay: "0.5s" },
    { id: 4, name: "Office", img: "/assets/img/icon-housing.png", properties: 60, delay: "0.7s" },
    { id: 5, name: "Building", img: "/assets/img/icon-building.png", properties: 45, delay: "0.1s" },
    { id: 6, name: "Townhouse", img: "/assets/img/icon-neighborhood.png", properties: 77, delay: "0.3s" },
    { id: 7, name: "Shop", img: "/assets/img/icon-condominium.png", properties: 30, delay: "0.5s" },
    { id: 8, name: "Garage", img: "/assets/img/icon-luxury.png", properties: 20, delay: "0.7s" }
];

const PropertyType = () => {
    const navigate = useNavigate();

    // Redirect to property list with selected type
    const handleCategoryClick = (type) => {
        navigate(`/property-list?type=${type}`);
    };

    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <h1 className="mb-3">Explore Property Types</h1>
                    <p>Browse through various property types to find the perfect place that fits your needs and lifestyle.</p>
                </div>
                <div className="row g-4">
                    {categories.map((category) => (
                        <div key={category.id} className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay={category.delay}>
                            <div 
                                className="cat-item d-block bg-light text-center rounded p-3"
                                style={{ cursor: "pointer" }} 
                                onClick={() => handleCategoryClick(category.name)}
                            >
                                <div className="rounded p-4">
                                    <div className="icon mb-3">
                                        <img className="img-fluid" src={category.img} alt={category.name} />
                                    </div>
                                    <h6>{category.name}</h6>
                                    <span>{category.properties} Properties</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PropertyType;
