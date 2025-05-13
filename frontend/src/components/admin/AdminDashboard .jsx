    import React, { useEffect, useState } from "react";
    import { useSelector } from "react-redux";
    import { useNavigate } from "react-router-dom";
    import { 
        LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
        BarChart, Bar, CartesianGrid, Legend
    } from "recharts";
    import { 
        FaHome, FaCheckCircle, FaClock, FaUserShield, FaCog,
        FaBell, FaChartLine, FaUsers, FaSignOutAlt, FaSearch,
        FaShoppingCart, FaBox, FaMoneyBillWave, FaUserCircle,
        FaFileAlt, FaStore, FaUserTie, FaEye
    } from "react-icons/fa";
    import axios from "axios";

    const AdminDashboard = () => {
        const { user } = useSelector((state) => state.auth);
        const navigate = useNavigate();
        const [stats, setStats] = useState({
            totalProperties: 0,
            approvedProperties: 0,
            pendingApprovals: 0,
            activeSellers: 0,
            newSellersThisWeek: 0,
            approvalRate: '0%',
            totalSales: 0,
            monthlyRevenue: 0
        });
        const [salesData, setSalesData] = useState([]);
        const [propertyData, setPropertyData] = useState([]);
        const [recentActivities, setRecentActivities] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [bookings, setBookings] = useState([]);

        // Mock data for demonstration
        const mockProperties = [
            { id: 1, title: "Beach Villa", price: "500000", type: "Villa", isApproved: true, createdAt: "2023-05-15" },
            { id: 2, title: "Mountain Cabin", price: "300000", type: "Cabin", isApproved: false, createdAt: "2023-06-20" },
            { id: 3, title: "City Apartment", price: "250000", type: "Apartment", isApproved: true, createdAt: "2023-07-10" },
            { id: 4, title: "Country House", price: "350000", type: "House", isApproved: true, createdAt: "2023-08-05" },
            { id: 5, title: "Luxury Penthouse", price: "800000", type: "Penthouse", isApproved: false, createdAt: "2023-09-12" }
        ];

        const mockSellers = [
            { id: 1, name: "John Doe", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 2, name: "Jane Smith", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 3, name: "Mike Johnson", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ];

        const mockActivities = [
            { id: 1, action: "Approved property listing", user: "John Doe", type: "success", createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
            { id: 2, action: "Rejected property submission", user: "Jane Smith", type: "error", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: 3, action: "Updated system settings", user: "Admin", type: "info", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() }
        ];

        useEffect(() => {
            const fetchDashboardData = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    
                    // Try to fetch real data first, fall back to mock data if API fails
                    let propertiesData = [];
                    let pendingData = [];
                    let sellersData = [];
                    let activitiesData = [];
                    let bookingsData = [];

                    try {
                        const [
                            propertiesRes, 
                            pendingRes, 
                            sellersRes,
                            activitiesRes,
                            bookingsRes
                        ] = await Promise.all([
                            axios.get('/api/properties/getallprop').catch(() => ({ data: mockProperties })),
                            axios.get('/api/properties/pending').catch(() => ({ data: mockProperties.filter(p => !p.isApproved) })),
                            axios.get('/api/agent').catch(() => ({ data: mockSellers })),
                            axios.get('/api/activities').catch(() => ({ data: mockActivities })),
                            axios.get('/api/bookings/admin').catch(() => ({ data: [] }))
                        ]);

                        propertiesData = Array.isArray(propertiesRes.data) ? propertiesRes.data : mockProperties;
                        pendingData = Array.isArray(pendingRes.data) ? pendingRes.data : mockProperties.filter(p => !p.isApproved);
                        sellersData = Array.isArray(sellersRes.data) ? sellersRes.data : mockSellers;
                        activitiesData = Array.isArray(activitiesRes.data) ? activitiesRes.data : mockActivities;
                        bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                    } catch (apiError) {
                        console.log("Using mock data due to API error:", apiError);
                        propertiesData = mockProperties;
                        pendingData = mockProperties.filter(p => !p.isApproved);
                        sellersData = mockSellers;
                        activitiesData = mockActivities;
                        bookingsData = [];
                    }

                    // Calculate stats
                    const totalProperties = propertiesData.length || 0;
                    const approvedProperties = propertiesData.filter(p => p?.isApproved).length || 0;
                    const pendingApprovals = pendingData.length || 0;
                    const activeSellers = sellersData.length || 0;
                    
                    // Calculate new sellers this week
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    const newSellersThisWeek = sellersData.filter(seller => 
                        seller?.createdAt && new Date(seller.createdAt) > oneWeekAgo
                    ).length || 0;

                    // Calculate approval rate
                    const approvalRate = totalProperties > 0 
                        ? Math.round((approvedProperties / totalProperties) * 100) + '%'
                        : '0%';

                    // Calculate sales statistics
                    const totalSales = bookingsData.reduce((sum, booking) => {
                        return sum + (booking.totalPrice || 0);
                    }, 0);

                    // Calculate monthly revenue (current month)
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const monthlyRevenue = bookingsData
                        .filter(booking => {
                            const bookingDate = new Date(booking.createdAt);
                            return bookingDate.getMonth() === currentMonth && 
                                   bookingDate.getFullYear() === currentYear;
                        })
                        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

                    setStats({
                        totalProperties,
                        approvedProperties,
                        pendingApprovals,
                        activeSellers,
                        newSellersThisWeek,
                        approvalRate,
                        totalSales,
                        monthlyRevenue
                    });

                    // Store bookings data
                    setBookings(bookingsData);

                    // Prepare chart data
                    setSalesData(prepareSalesData(bookingsData));
                    setPropertyData(preparePropertyData(propertiesData));
                    setRecentActivities(activitiesData);

                } catch (error) {
                    console.error("Error in dashboard data processing:", error);
                    setError("Failed to load dashboard data. Showing mock data instead.");
                    
                    // Fallback to mock data
                    const totalProperties = mockProperties.length;
                    const approvedProperties = mockProperties.filter(p => p.isApproved).length;
                    const pendingApprovals = mockProperties.filter(p => !p.isApproved).length;
                    const activeSellers = mockSellers.length;
                    const newSellersThisWeek = mockSellers.filter(seller => 
                        new Date(seller.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length;
                    const approvalRate = Math.round((approvedProperties / totalProperties) * 100) + '%';

                    setStats({
                        totalProperties,
                        approvedProperties,
                        pendingApprovals,
                        activeSellers,
                        newSellersThisWeek,
                        approvalRate,
                        totalSales: 0,
                        monthlyRevenue: 0
                    });

                    setSalesData(prepareSalesData([]));
                    setPropertyData(preparePropertyData(mockProperties));
                    setRecentActivities(mockActivities);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        }, []);

        // Prepare sales data for chart
        const prepareSalesData = (bookings = []) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            // Get last 6 months including current month
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
                last6Months.push({ month: months[monthIndex], monthIndex, year });
            }
            
            // Calculate sales per month
            return last6Months.map(({ month, monthIndex, year }) => {
                const monthBookings = bookings.filter(booking => {
                    try {
                        const bookingDate = new Date(booking.createdAt);
                        return bookingDate.getMonth() === monthIndex && 
                               bookingDate.getFullYear() === year;
                    } catch (e) {
                        console.error('Error processing booking date:', e);
                        return false;
                    }
                });
                
                const totalSales = monthBookings.reduce((sum, booking) => {
                    return sum + (booking.totalPrice || 0);
                }, 0);
                
                return {
                    month,
                    sales: totalSales || 0, // Ensure we never return undefined
                    bookings: monthBookings.length
                };
            });
        };

        // Prepare property data for chart
        const preparePropertyData = (properties = []) => {
            const typeCounts = properties.reduce((acc, prop) => {
                try {
                    const type = prop?.type || 'Unknown';
                    if (!acc[type]) {
                        acc[type] = { approved: 0, total: 0 };
                    }
                    acc[type].total++;
                    if (prop?.isApproved) {
                        acc[type].approved++;
                    }
                } catch (e) {
                    console.error('Error processing property:', e);
                }
                return acc;
            }, {});
            
            return Object.entries(typeCounts).map(([name, counts]) => ({
                name,
                approved: counts.approved || 0,
                pending: (counts.total || 0) - (counts.approved || 0)
            }));
        };

        // Handle quick action button clicks
        const handleQuickAction = (action) => {
            switch(action) {
                case "Review Properties":
                    navigate("/admin/approvals");
                    break;
                case "Approve Sellers":
                    navigate("/admin/users");
                    break;
                case "Manage Sellers":
                    navigate("/admin/users");
                    break;
                // case "View Seller Properties":
                //     navigate("/admin/orders");
                //     break;
                case "Manage Users":
                    navigate("/admin/users");
                    break;
                case "Generate Reports":
                    // For now, just show an alert
                    alert("Reports generation feature coming soon!");
                    break;
                default:
                    break;
            }
        };

        // Handle view all activities
        const handleViewAllActivities = () => {
            navigate("/admin/activities");
        };

        // Format date for display
        const formatDate = (dateString) => {
            if (!dateString) return 'Recently';
            
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Just now';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} day${days > 1 ? 's' : ''} ago`;
            } else {
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        };

        if (loading) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh' 
                }}>
                    <div>Loading dashboard data...</div>
                </div>
            );
        }

        return (
            <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
                {/* Main Content */}
                <div className="main-content" style={{ flex: 1, padding: '20px' }}>
                    {error && (
                        <div style={{ 
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                            padding: '15px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FaFileAlt style={{ marginRight: '10px' }} />
                            {error}
                        </div>
                    )}

                    {/* Top Header */}
                    <div className="header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '20px',
                        backgroundColor: '#fff',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <div className="search-bar" style={{ position: 'relative', width: '400px' }}>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                style={{
                                    width: '100%',
                                    padding: '10px 15px 10px 40px',
                                    border: '1px solid #ddd',
                                    borderRadius: '30px',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                            <FaSearch style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#999'
                            }} />
                        </div>
                        
                        <div className="user-actions" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                position: 'relative', 
                                marginRight: '25px',
                                cursor: 'pointer'
                            }}>
                                <FaBell style={{ color: '#666', fontSize: '18px' }} />
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    backgroundColor: '#ff5722',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px'
                                }}>{stats.pendingApprovals}</span>
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e0e0e0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '10px'
                                }}>
                                    <FaUserCircle style={{ color: '#666', fontSize: '20px' }} />
                                </div>
                                <span style={{ color: '#333', fontWeight: '500' }}>{user?.name || "Admin"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div style={{ 
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ 
                            marginTop: '0',
                            marginBottom: '15px',
                            color: '#333',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}>Welcome back, {user?.name || "Admin"}!</h3>
                        <p style={{ 
                            color: '#666',
                            marginBottom: '20px'
                        }}>
                            You have {stats.pendingApprovals} properties waiting for approval and {stats.newSellersThisWeek} new sellers this week.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => handleQuickAction("Review Properties")}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaCheckCircle style={{ marginRight: '8px' }} />
                                Review Properties
                            </button>
                            <button 
                                onClick={() => handleQuickAction("Manage Sellers")}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    color: '#4CAF50',
                                    border: '1px solid #4CAF50',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaUserTie style={{ marginRight: '8px' }} />
                                Manage Sellers
                            </button>
                        </div>
                    </div>

                    {/* Statistic Cards */}
                    <div className="stats-row" style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {[
                            { label: "Total Properties", value: stats.totalProperties, icon: <FaHome />, color: '#2196F3' },
                            { label: "Approved Properties", value: stats.approvedProperties, icon: <FaCheckCircle />, color: '#4CAF50' },
                            { label: "Pending Approvals", value: stats.pendingApprovals, icon: <FaClock />, color: '#FFC107' },
                            { label: "Active Sellers", value: stats.activeSellers, icon: <FaUserTie />, color: '#9C27B0' }
                        ].map((card, index) => (
                            <div key={index} style={{ 
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                padding: '20px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '8px',
                                    backgroundColor: `${card.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    color: card.color,
                                    fontSize: '20px'
                                }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <div style={{ 
                                        fontSize: '24px', 
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '5px'
                                    }}>{card.value}</div>
                                    <div style={{ 
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>{card.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="charts-row" style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {/* Sales Chart */}
                        <div style={{ 
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ 
                                marginTop: '0',
                                marginBottom: '20px',
                                color: '#333',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>Sales Overview</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" stroke="#666" />
                                    <YAxis yAxisId="left" stroke="#4CAF50" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#2196F3" />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#4CAF50" 
                                        strokeWidth={2} 
                                        dot={{ r: 4 }} 
                                        activeDot={{ r: 6 }} 
                                        name="Sales ($)"
                                    />
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="bookings" 
                                        stroke="#2196F3" 
                                        strokeWidth={2} 
                                        dot={{ r: 4 }} 
                                        activeDot={{ r: 6 }} 
                                        name="Bookings"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginTop: '15px',
                                padding: '0 10px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Total Sales</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                                        ${stats.totalSales.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Monthly Revenue</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                                        ${stats.monthlyRevenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Property Performance Chart */}
                        <div style={{ 
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ 
                                marginTop: '0',
                                marginBottom: '20px',
                                color: '#333',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>Property Approvals by Type</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={propertyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar 
                                        dataKey="approved" 
                                        fill="#4CAF50" 
                                        radius={[4, 4, 0, 0]}
                                        name="Approved"
                                    />
                                    <Bar 
                                        dataKey="pending" 
                                        fill="#FFC107" 
                                        radius={[4, 4, 0, 0]}
                                        name="Pending"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activities Section */}
                    <div style={{ 
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        marginBottom: '20px'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ 
                                margin: '0',
                                color: '#333',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>Recent Activities</h3>
                            <button 
                                onClick={handleViewAllActivities}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#4CAF50',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                View All <FaEye style={{ marginLeft: '5px' }} />
                            </button>
                        </div>
                        
                        <div>
                            {recentActivities.length > 0 ? (
                                recentActivities.map(activity => (
                                    <div key={activity._id || activity.id} style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '15px 0',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: activity.type === 'success' ? '#e8f5e9' : 
                                                            activity.type === 'error' ? '#ffebee' : '#e3f2fd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '15px',
                                            color: activity.type === 'success' ? '#4CAF50' : 
                                                activity.type === 'error' ? '#f44336' : '#2196F3'
                                        }}>
                                            {activity.type === 'success' ? (
                                                <FaCheckCircle size={16} />
                                            ) : activity.type === 'error' ? (
                                                <FaFileAlt size={16} />
                                            ) : (
                                                <FaCog size={16} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#333',
                                                marginBottom: '4px'
                                            }}>{activity.action}</div>
                                            <div style={{ 
                                                fontSize: '12px',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ 
                                                    display: 'inline-block',
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: activity.type === 'success' ? '#4CAF50' : 
                                                                    activity.type === 'error' ? '#f44336' : '#2196F3',
                                                    marginRight: '8px'
                                                }}></span>
                                                {activity.user} • {formatDate(activity.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ 
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#666'
                                }}>
                                    No recent activities found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div style={{ 
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ 
                            marginTop: '0',
                            marginBottom: '20px',
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>Quick Actions</h3>
                        
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '15px'
                        }}>
                            {[
                                { label: "Review Properties", icon: <FaCheckCircle />, count: stats.pendingApprovals },
                                { label: "Approve Sellers", icon: <FaUserTie /> },
                                { label: "View Seller Properties", icon: <FaStore /> },
                                { label: "Manage Users", icon: <FaUserShield /> },
                                { label: "Generate Reports", icon: <FaFileAlt /> }
                            ].map((action, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handleQuickAction(action.label)}
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        ':hover': {
                                            backgroundColor: '#eee'
                                        }
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: '#e3f2fd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px',
                                        color: '#2196F3'
                                    }}>
                                        {action.icon}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ 
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>{action.label}</div>
                                        {action.count && (
                                            <div style={{ 
                                                fontSize: '12px',
                                                color: '#666',
                                                marginTop: '4px'
                                            }}>
                                                {action.count} pending
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default AdminDashboard;