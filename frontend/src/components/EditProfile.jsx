import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { setCredentials } from "../redux/authSlice";

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    profileImage: null,
    existingImage: null // Added to track existing image separately
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3001/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data.user;
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          profileImage: null, // Keep this null for new uploads
          existingImage: userData.profileImage // Store existing image separately
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to fetch profile data!",
          text: error.response?.data?.message || "Something went wrong.",
        });
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profileImage: e.target.files[0],
        existingImage: null // Clear existing image when new one is selected
      });
    }
  };

  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded?.userId || decoded?.id; // Check both common ID fields
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user?._id || getUserIdFromToken(token);
      if (!userId) {
        throw new Error("User ID is missing!");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);
      
      // Only append profileImage if it's a new file
      if (formData.profileImage instanceof File) {
        formDataToSend.append("profileImage", formData.profileImage);
      }

      const response = await axios.put(
        `http://localhost:3001/user/profile/${userId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update Redux store with the updated user data
      dispatch(setCredentials({ 
        user: response.data.updatedUser, 
        token 
      }));

      Swal.fire({
        icon: "success",
        title: "Profile Updated Successfully!",
        showConfirmButton: false,
        timer: 2000,
      });

      navigate("/");
    } catch (error) {
      console.error("Profile update failed:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        text: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow-lg">
            <h2 className="text-center mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Profile Image</label>
                <input
                  type="file"
                  className="form-control"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {(formData.existingImage || formData.profileImage) && (
                  <img
                    src={
                      formData.profileImage 
                        ? URL.createObjectURL(formData.profileImage) 
                        : `http://localhost:3001${formData.existingImage}`
                    }
                    alt="Profile Preview"
                    style={{ 
                      width: "100px", 
                      height: "100px", 
                      marginTop: "10px",
                      objectFit: "cover",
                      borderRadius: "50%"
                    }}
                  />
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;