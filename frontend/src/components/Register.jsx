import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user && token) {
      navigate("/");
    }
  }, [user, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataWithImage = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataWithImage.append(key, formData[key]);
    });

    try {
      const response = await axios.post(
        "http://localhost:3001/user/register",
        formDataWithImage,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Signup Successful!",
          text: "You will be redirected to the login page.",
          showConfirmButton: false,
          timer: 2000,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Signup Failed!",
          text: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      Swal.fire({
        icon: "error",
        title: "Signup Failed!",
        text: error.response?.data?.message || "Something went wrong. Try again.",
      });
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa",width:"100%" }}
    >
      <div className="container">
        <div className="row justify-content-center">
        <div className="col-md-6">
  <div className="card p-5 shadow-lg border-0 rounded-4">
    <div className="text-center mb-4">
      <h1 className="mb-3">Sign Up</h1>
      <p>Create your account to get started!</p>
    </div>
    <form id="signupForm" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3 form-floating">
            <input
              type="text"
              className="form-control"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
            />
            <label>First Name</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3 form-floating">
            <input
              type="text"
              className="form-control"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
            />
            <label>Last Name</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3 form-floating">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />
            <label>Email</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3 form-floating">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
            <label>Password</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3 form-floating">
            <input
              type="text"
              className="form-control"
              name="phoneNumber"
              placeholder="Phone Number"
              onChange={handleChange}
            />
            <label>Phone Number</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3 form-floating">
            <textarea
              className="form-control"
              placeholder="Address"
              name="address"
              onChange={handleChange}
            ></textarea>
            <label>Address</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <div className="input-group d-flex align-items-center">
              <label htmlFor="profileImage" className="btn d-flex align-items-center">
                <i
                  className="bi bi-upload text-black me-2"
                  style={{
                    border: "1px solid black",
                    padding: "20px",
                    borderRadius: "5px",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                ></i>
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                className="form-control d-none"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="ms-3"
                  style={{
                    width: "75px",
                    height: "75px",
                    borderRadius: "5px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <button className="btn btn-primary w-100 py-3" type="submit">
        Sign Up
      </button>
    </form>
    <div className="text-center mt-3">
      <p>
        Already have an account?{" "}
        <Link to="/login" className="text-primary">
          Login here
        </Link>
      </p>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default Register;


// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";

// const Register = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     role: "buyer",
//     phoneNumber: "",
//     address: "",
//     profileImage: null,
//   });

//   const [imagePreview, setImagePreview] = useState(null);

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Handle image upload
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({ ...formData, profileImage: file });
//       setImagePreview(URL.createObjectURL(file)); // Image preview
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formDataWithImage = new FormData();
//     Object.keys(formData).forEach((key) => {
//       formDataWithImage.append(key, formData[key]);
//     });

//     try {
//       const response = await axios.post(
//         "http://localhost:5000/user/register",
//         formDataWithImage,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (response.status === 201) {
//         Swal.fire({
//           icon: "success",
//           title: "Signup Successful!",
//           text: "Redirecting to login...",
//           showConfirmButton: false,
//           timer: 2000,
//         });

//         setTimeout(() => {
//           navigate("/login");
//         }, 2000);
//       }
//     } catch (error) {
//       console.error("Signup failed:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Signup Failed!",
//         text: error.response?.data?.message || "Something went wrong. Try again.",
//       });
//     }
//   };

//   return (
//     <div
//       className="container-fluid d-flex justify-content-center align-items-center"
//       style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
//     >
//       <div className="container">
//         <div className="row justify-content-center">
//           <div className="col-md-6">
//             <div className="card p-5 shadow-lg border-0 rounded-4">
//               <div className="text-center mb-4">
//                 <h1 className="mb-3">Sign Up</h1>
//                 <p>Create your account to get started!</p>
//               </div>
//               <form id="signupForm" onSubmit={handleSubmit} encType="multipart/form-data">
//                 <div className="mb-3">
//                   <label className="form-label">First Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     name="firstName"
//                     placeholder="Enter your first name"
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Last Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     name="lastName"
//                     placeholder="Enter your last name"
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Email</label>
//                   <input
//                     type="email"
//                     className="form-control"
//                     name="email"
//                     placeholder="Enter your email"
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Password</label>
//                   <input
//                     type="password"
//                     className="form-control"
//                     name="password"
//                     placeholder="Enter your password"
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Phone Number</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     name="phoneNumber"
//                     placeholder="Enter your phone number"
//                     onChange={handleChange}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Role</label>
//                   <select
//                     className="form-select"
//                     name="role"
//                     onChange={handleChange}
//                     defaultValue="buyer"
//                   >
//                     <option value="buyer">Buyer</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Address</label>
//                   <textarea
//                     className="form-control"
//                     placeholder="Enter your address"
//                     name="address"
//                     style={{ height: "100px" }}
//                     onChange={handleChange}
//                   ></textarea>
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Profile Image</label>
//                   <div className="d-flex align-items-center">
//                     <input
//                       type="file"
//                       name="profileImage"
//                       className="form-control"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                     />
//                     {imagePreview && (
//                       <img
//                         src={imagePreview}
//                         alt="Preview"
//                         className="ms-3"
//                         style={{
//                           width: "50px",
//                           height: "50px",
//                           borderRadius: "5px",
//                           objectFit: "cover",
//                         }}
//                       />
//                     )}
//                   </div>
//                 </div>
//                 <button className="btn btn-primary w-100 py-3" type="submit">
//                   Sign Up
//                 </button>
//               </form>
//               <div className="text-center mt-3">
//                 <p>
//                   Already have an account?{" "}
//                   <Link to="/login" className="text-primary">
//                     Login here
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;