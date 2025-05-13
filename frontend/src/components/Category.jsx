import React from 'react';

const categories = [
    { id: 1, name: "Apartment", img: "/assets/img/icon-apartment.png", properties: 156, delay: "0.1s" },
    { id: 2, name: "Villa", img: "/assets/img/icon-villa.png", properties: 89, delay: "0.3s" },
    { id: 3, name: "Home", img: "/assets/img/icon-house.png", properties: 234, delay: "0.5s" },
    { id: 4, name: "Office", img: "/assets/img/icon-housing.png", properties: 78, delay: "0.7s" },
    { id: 5, name: "Building", img: "/assets/img/icon-building.png", properties: 45, delay: "0.1s" },
    { id: 6, name: "Townhouse", img: "/assets/img/icon-neighborhood.png", properties: 112, delay: "0.3s" },
    { id: 7, name: "Shop", img: "/assets/img/icon-condominium.png", properties: 67, delay: "0.5s" },
    { id: 8, name: "Garage", img: "/assets/img/icon-luxury.png", properties: 34, delay: "0.7s" }
];

const Category = () => {
    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <h1 className="mb-3">Property Types</h1>
                    <p>Explore our diverse range of properties to find your perfect match. From cozy apartments to luxurious villas, we offer a wide selection of properties to suit every lifestyle and budget. Browse through our categories to discover your dream property.</p>
                </div>
                <div className="row g-4">
                    {categories.map((category) => (
                        <div key={category.id} className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay={category.delay}>
                            <a className="cat-item d-block bg-light text-center rounded p-3" href="#!">
                                <div className="rounded p-4">
                                    <div className="icon mb-3">
                                        <img className="img-fluid" src={category.img} alt={category.name} />
                                    </div>
                                    <h6>{category.name}</h6>
                                    <span>{category.properties} Properties</span>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Category;