import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const AddProperty = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    type: "",
    listingStatus: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        Swal.fire("Invalid File", "Please upload an image file (JPEG, PNG, etc.)", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("File Too Large", "Please upload an image smaller than 5MB", "error");
        return;
      }

      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (
        !formData.title ||
        !formData.price ||
        !formData.location ||
        !formData.bedrooms ||
        !formData.bathrooms ||
        !formData.type ||
        !formData.listingStatus
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (!user || !token) {
        throw new Error("You must be logged in to add a property");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("bedrooms", formData.bedrooms);
      formDataToSend.append("bathrooms", formData.bathrooms);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("listingStatus", formData.listingStatus);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.post(
        "http://localhost:3001/api/properties/createprop",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Property Added Successfully!",
          text: "Your property is pending admin approval.",
          showConfirmButton: false,
          timer: 2000,
        });
        setTimeout(() => {
          navigate("/property-list");
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5 mb-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow bg-light">
            <div className="card-header bg-transparent text-center">
              <h3 className="mb-4">Add New Property</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bedrooms</label>
                    <input
                      type="number"
                      className="form-control"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bathrooms</label>
                    <input
                      type="number"
                      className="form-control"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Property Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Office">Office</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Building">Building</option>
                      <option value="Home">Home</option>
                      <option value="Shop">Shop</option>
                      <option value="Garage">Garage</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Listing Status</label>
                    <select
                      className="form-select"
                      name="listingStatus"
                      value={formData.listingStatus}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="For Sale">For Sale</option>
                      <option value="For Rent">For Rent</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Property Image</label>
                  <input
                    type="file"
                    className="form-control"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Adding Property...
                      </>
                    ) : (
                      "Add Property"
                    )}
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

export default AddProperty;
