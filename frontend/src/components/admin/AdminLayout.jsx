import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../redux/state";
import Swal from "sweetalert2";
import { 
    FaTachometerAlt, 
    FaCheckCircle, 
    FaUsers, 
    FaSignOutAlt,
    FaUserTie,
    FaShoppingCart,
    FaFileAlt,
    FaChartLine,
    FaHome
} from "react-icons/fa";

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Sample data for pending approvals badge
    const stats = {
        pendingApprovals: 5
    };

    const handleLogout = () => {
        Swal.fire({
            title: "Logout Confirmation",
            text: "Are you sure you want to logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(clearCredentials());
                navigate("/login");
            }
        });
    };

    return (
        <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
            {/* Sidebar - Redesigned */}
            <div className="sidebar" style={{ 
                width: '250px', 
                backgroundColor: '#fff', 
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                padding: '20px 0'
            }}>
                <div className="sidebar-header" style={{ padding: '0 20px 20px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                        <FaChartLine style={{ marginRight: '10px', color: '#4CAF50' }} />
                        <span style={{ color: '#333' }}>Admin Panel</span>
                    </h3>
                </div>
                
                <nav className="sidebar-nav" style={{ padding: '20px 0' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ marginBottom: '5px' }}>
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) => isActive ? "active-nav-link" : ""}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#666',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500'
                                }}
                                activeStyle={{
                                    color: '#4CAF50',
                                    backgroundColor: '#e8f5e9'
                                }}
                            >
                                <FaHome style={{ marginRight: '10px' }} />
                                Dashboard
                            </NavLink>
                        </li>
                        <li style={{ marginBottom: '5px' }}>
                            <NavLink
                                to="/admin/approvals"
                                className={({ isActive }) => isActive ? "active-nav-link" : ""}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#666',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500'
                                }}
                                activeStyle={{
                                    color: '#4CAF50',
                                    backgroundColor: '#e8f5e9'
                                }}
                            >
                                <FaCheckCircle style={{ marginRight: '10px' }} />
                                Property Approvals
                                {stats.pendingApprovals > 0 && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        backgroundColor: '#ff5722',
                                        color: 'white',
                                        borderRadius: '10px',
                                        padding: '2px 8px',
                                        fontSize: '12px'
                                    }}>{stats.pendingApprovals}</span>
                                )}
                            </NavLink>
                        </li>
                        <li style={{ marginBottom: '5px' }}>
                            <NavLink
                                to="/admin/rejected"
                                className={({ isActive }) => isActive ? "active-nav-link" : ""}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#666',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500'
                                }}
                                activeStyle={{
                                    color: '#4CAF50',
                                    backgroundColor: '#e8f5e9'
                                }}
                            >
                                <FaCheckCircle style={{ marginRight: '10px' }} />
                                Property Rejected
                                {stats.pendingApprovals > 0 && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        backgroundColor: '#ff5722',
                                        color: 'white',
                                        borderRadius: '10px',
                                        padding: '2px 8px',
                                        fontSize: '12px'
                                    }}>{stats.pendingApprovals}</span>
                                )}
                            </NavLink>
                        </li>
                        
                        <li style={{ marginBottom: '5px' }}>
                            <NavLink
                                to="/admin/contactmsg"
                                className={({ isActive }) => isActive ? "active-nav-link" : ""}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#666',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500'
                                }}
                                activeStyle={{
                                    color: '#4CAF50',
                                    backgroundColor: '#e8f5e9'
                                }}
                            >
                                <FaUsers style={{ marginRight: '10px' }} />
                                Contact Messages
                            </NavLink>
                        </li>
                        
                        <li style={{ marginBottom: '5px' }}>
                            <NavLink
                                to="/admin/users"
                                className={({ isActive }) => isActive ? "active-nav-link" : ""}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#666',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500'
                                }}
                                activeStyle={{
                                    color: '#4CAF50',
                                    backgroundColor: '#e8f5e9'
                                }}
                            >
                                <FaUsers style={{ marginRight: '10px' }} />
                                User Management
                            </NavLink>
                        </li>
                        <li style={{ marginBottom: '5px' }}>
                            <NavLink
                                to="/admin/users"
                                className={({ isActive }) => isActive ? "active-nav-link" : ""}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#666',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500'
                                }}
                                activeStyle={{
                                    color: '#4CAF50',
                                    backgroundColor: '#e8f5e9'
                                }}
                            >
                                <FaFileAlt style={{ marginRight: '10px' }} />
                                Reports
                            </NavLink>
                        </li>
                        <li style={{ marginBottom: '5px', marginTop: '20px' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#f44336',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    textDecoration: 'none',
                                    borderRadius: '0 30px 30px 0',
                                    fontWeight: '500',
                                    width: '100%',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: '#ffebee'
                                    }
                                }}
                            >
                                <FaSignOutAlt style={{ marginRight: '10px' }} />
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ 
                flexGrow: 1,
                padding: "20px"
            }}>
                <div className="content-container" style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    padding: "25px",
                    minHeight: "calc(100vh - 40px)"
                }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;