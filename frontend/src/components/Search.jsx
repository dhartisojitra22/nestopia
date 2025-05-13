import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [propertyType, setPropertyType] = useState(''); // State for property type
  const [location, setLocation] = useState(''); // State for location
  const [searchKeyword, setSearchKeyword] = useState(''); // State for keyword search
  const [properties, setProperties] = useState([]); // Store search results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error state

  // Handle search button click
  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      // Make API request to the backend with search filters
      const response = await axios.get('http://localhost:3001/api/properties/getallprop', {
        params: {
          search: searchKeyword,
          type: propertyType,
          location: location,
        },
      });

      // Set the fetched properties in state
      setProperties(response.data);
    } catch (error) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-primary mb-5 wow fadeIn" data-wow-delay="0.1s" style={{ padding: '35px' }}>
      <div className="container">
        <div className="row g-2">
          <div className="col-md-10">
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control border-0 py-3"
                  placeholder="Search Keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)} // Controlled input
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select border-0 py-3"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">---Property Type---</option>
                  <option value="1">Apartment</option>
                  <option value="2">Villa</option>
                  <option value="2">Office</option>
                  <option value="2">Townhouse</option>
                  <option value="2">Shop</option>
                  <option value="2">Garage</option>
                  <option value="2">Building</option>
                  <option value="2">Home</option>

                </select>
              </div>
              {/* <div className="col-md-4">
                  <input
                  type="text"
                  className="form-control border-0 py-3"
                  placeholder=" Search By Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)} 
                />
              </div> */}
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-dark border-0 w-100 py-3" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        {loading && <div className="text-center my-4">Loading...</div>}
        {error && <div className="text-center text-danger my-4">{error}</div>}

        {/* Display search results */}
        <div className="row mt-4">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div className="col-lg-4 col-md-6" key={property._id}>
                <div className="property-item rounded overflow-hidden d-flex flex-column w-100 shadow">
                  <img
                    className="img-fluid w-100"
                    src={`http://localhost:3001/${property.image}`}
                    alt={property.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="p-4 flex-grow-1 d-flex flex-column">
                    <h5 className="text-primary mb-3">${property.price}</h5>
                    <h6>{property.title}</h6>
                    <p>{property.location}</p>
                    <p>{property.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No properties found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
