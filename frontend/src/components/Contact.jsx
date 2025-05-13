import React, { useState } from "react";
import axios from "axios";

const ContactAdminForm = ({ adminEmail }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3001/api/contact/contact-admin",
        formData
      );
      setStatus("✅ Email sent successfully!");
      setFormData({ name: "", email: "", message: "" }); // Clear form after success
    } catch (error) {
      setStatus("❌ Failed to send email. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "50%",
          borderRadius: "10px",
          border: "1px solid #ddd",
          backgroundColor: "#fff",
        }}
      >
        <h2 className="text-center text-primary mb-4"> Contact Us </h2>{" "}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="fw-bold"> Your Name: </label>{" "}
            <input
              type="text"
              name="name"
              className="form-control p-2"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>{" "}
          <div className="mb-3">
            <label className="fw-bold"> Your Email: </label>{" "}
            <input
              type="email"
              name="email"
              className="form-control p-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>{" "}
          <div className="mb-3">
            <label className="fw-bold"> Your Message: </label>{" "}
            <textarea
              name="message"
              className="form-control p-2"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            >
              {" "}
            </textarea>{" "}
          </div>{" "}
          <button type="submit" className="btn btn-primary w-100 p-2">
            {" "}
            Send Message{" "}
          </button>{" "}
        </form>{" "}
        {status && <p className="text-center mt-3"> {status} </p>}{" "}
      </div>{" "}
    </div>
  );
};

export default ContactAdminForm;