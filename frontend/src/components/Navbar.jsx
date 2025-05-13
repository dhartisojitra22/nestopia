import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials } from "../redux/state"; 
import { FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const { user } = useSelector((state) => state.auth);


  const fullProfileImageUrl = user?.profileImage
    ? `http://localhost:3001${user.profileImage}`
    : null;

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="container-fluid nav-bar bg-transparent">
      <nav className="navbar navbar-expand-lg bg-white navbar-light py-0 px-4">
        <NavLink to="/" className="navbar-brand d-flex align-items-center text-center">
          <div className="icon p-2 me-2">
            <img className="img-fluid" src="/assets/img/icon-deal.png" alt="Icon" style={{ width: "30px", height: "30px" }} />
          </div>
          <h1 className="m-0 text-primary">Nestopia</h1>
        </NavLink>
        <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-item nav-link active" : "nav-item nav-link")}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "nav-item nav-link active" : "nav-item nav-link")}
            >
              About
            </NavLink>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Property</a>
              <div className="dropdown-menu rounded-0 m-0">
                <NavLink to="/property-list" className="dropdown-item">Property List</NavLink>
                <NavLink to="/property-type" className="dropdown-item">Property Type</NavLink>
                <NavLink to="/property-agents" className="dropdown-item">Property Agent</NavLink>
              </div>
            </div>
            {/* <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Pages</a>
              <div className="dropdown-menu rounded-0 m-0">
                <NavLink to="/testimonial" className="dropdown-item">Testimonial</NavLink>
                <NavLink to="/404" className="dropdown-item">404 Error</NavLink>
              </div>
            </div> */}
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "nav-item nav-link active" : "nav-item nav-link")}
            >
              Contact
            </NavLink>
          </div>
          {user ? (
            <div className="position-relative">
              <img
                src={fullProfileImageUrl}
                alt="Profile"
                className="rounded-circle p-2 border"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
                onClick={() => setShowDropdown(!showDropdown)}
                onError={(e) => {
                  e.target.src = '/path/to/default/image.png';
                }}
              />
              {showDropdown && (
                <div 
                  className="dropdown-menu show position-absolute shadow" 
                  style={{ right: 0, top: '50px', zIndex: 1000 }}
                >
                  <button className="dropdown-item" onClick={handleEditProfile}> 
                    <FaUserEdit size={20} style={{ color: "gray" }} /> Edit Profile
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}> 
                    <FaSignOutAlt size={20} style={{ color: "gray" }} /> Logout
                  </button>
                <NavLink to={'/addproperty'} className="dropdown-item">Add Property</NavLink>
                <NavLink to={'/wishlist'} className="dropdown-item">WishList</NavLink>
                <NavLink to={'/myproperties'} className="dropdown-item">My Properties</NavLink>

                {/* <NavLink to={'/reservation-list'} className="dropdown-item">Reservation List</NavLink> */}
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary px-3 d-none d-lg-flex">
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;



