import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [property, setProperty] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    image: null,
  });

  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/properties/getprop/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProperty(response.data);
        setExistingImage(response.data.image);
      } catch (error) {
        console.error("Error fetching property:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to load property",
        });
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image") {
      setProperty({ ...property, image: files[0] });
    } else {
      setProperty({ ...property, [name]: value });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!property.title.trim()) newErrors.title = "Title is required";
    if (!property.description.trim()) newErrors.description = "Description is required";
    if (!property.price) newErrors.price = "Price is required";
    if (!property.location.trim()) newErrors.location = "Location is required";
    if (!property.bedrooms) newErrors.bedrooms = "Bedrooms is required";
    if (!property.bathrooms) newErrors.bathrooms = "Bathrooms is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(property).forEach((key) => {
      if (property[key] !== null && property[key] !== undefined) {
        formData.append(key, property[key]);
      }
    });

    // Keep existing image if no new one is uploaded
    if (!property.image && existingImage) {
      formData.append("image", existingImage);
    }

    try {
      await axios.patch(
        `http://localhost:3001/api/properties/updateprop/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Property updated successfully",
        timer: 2000,
      }).then(() => {
        navigate(`/property/${id}`);
      });
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update property",
      });
      
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Edit Property</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                  <label className="form-label">Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={property.title}
                    onChange={handleChange}
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Description*</label>
                  <textarea
                    name="description"
                    value={property.description}
                    onChange={handleChange}
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    rows="5"
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price ($)*</label>
                    <input
                      type="number"
                      name="price"
                      value={property.price}
                      onChange={handleChange}
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                    />
                    {errors.price && (
                      <div className="invalid-feedback">{errors.price}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location*</label>
                    <input
                      type="text"
                      name="location"
                      value={property.location}
                      onChange={handleChange}
                      className={`form-control ${errors.location ? "is-invalid" : ""}`}
                    />
                    {errors.location && (
                      <div className="invalid-feedback">{errors.location}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bedrooms*</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={property.bedrooms}
                      onChange={handleChange}
                      className={`form-control ${errors.bedrooms ? "is-invalid" : ""}`}
                    />
                    {errors.bedrooms && (
                      <div className="invalid-feedback">{errors.bedrooms}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bathrooms*</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={property.bathrooms}
                      onChange={handleChange}
                      className={`form-control ${errors.bathrooms ? "is-invalid" : ""}`}
                    />
                    {errors.bathrooms && (
                      <div className="invalid-feedback">{errors.bathrooms}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Property Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="form-control"
                    accept="image/*"
                  />
                  <small className="text-muted">
                    Leave empty to keep current image
                  </small>
                </div>

                {existingImage && (
                  <div className="mb-3">
                    <label className="form-label">Current Image</label>
                    <div className="border p-2 text-center">
                      <img
                        src={`http://localhost:3001/${existingImage}`}
                        alt="Current property"
                        className="img-fluid rounded"
                        style={{ maxHeight: "200px" }}
                        onError={(e) => {
                          e.target.src = "/images/default-property.jpg";
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-md-2"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;