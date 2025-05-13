import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { setCredentials } from "../redux/state";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("resetSuccess") === "true") {
      Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "Your password has been reset successfully. Please log in with your new password.",
        showConfirmButton: false,
        timer: 3000,
      });
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // In your handleSubmit function in Login.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/user/login", formData);
      if (response.status === 200) {
        const { token, user } = response.data;
        dispatch(setCredentials({ user, token, role: user.role }));
        
        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Redirecting to your dashboard...",
          showConfirmButton: false,
          timer: 500,
        });
        
        // Navigate after the alert is shown
        if (user.email === 'admin@gmail.com') {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed!",
        text: error.response?.data?.message || "Invalid credentials. Please try again.",
      });
    }
  };  

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Forgot Password",
      input: "email",
      inputLabel: "Enter your email address",
      inputPlaceholder: "Email",
      showCancelButton: true,
      confirmButtonText: "Send Reset Link",
      inputValidator: (value) => (!value ? "You need to enter your email!" : null),
    });

    if (email) {
      try {
        const response = await axios.post("http://localhost:3001/user/password/forgot-password", { email });
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Reset Link Sent!",
            text: "Please check your email for the password reset link.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to send reset link. Please try again.",
        });
      }
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-5 shadow-lg border-0 rounded-4">
              <div className="text-center mb-4">
                <h1 className="mb-3">Login</h1>
                <p>Access your account by logging in below.</p>
              </div>
              <form id="loginForm" onSubmit={handleSubmit}>
                <div className="mb-3 form-floating">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                  />
                  <label>Email</label>
                </div>
                <div className="mb-3 form-floating">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                  />
                  <label>Password</label>
                </div>
                <div className="mb-3 text-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-decoration-none text-primary bg-transparent border-0 p-0"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button className="btn btn-primary w-100 py-3" type="submit">
                  Login
                </button>
              </form>
              <div className="text-center mt-3">
                <p>
                  Don’t have an account? <Link to="/signup" className="text-primary">Sign up here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;