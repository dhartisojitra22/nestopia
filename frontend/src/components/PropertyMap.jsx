import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 37.7749, // Default center (San Francisco)
  lng: -122.4194,
};

const PropertyMap = ({ properties }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your API key
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={10}
      center={center}
    >
      {properties.map((property) => (
        <Marker
          key={property._id}
          position={{ lat: property.latitude, lng: property.longitude }}
          title={property.title}
        />
      ))}
    </GoogleMap>
  );
};

export default PropertyMap;