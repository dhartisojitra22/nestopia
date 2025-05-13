import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';

const ActivitiesPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalActivities, setTotalActivities] = useState(0);
    const navigate = useNavigate();

    const fetchActivities = async (page = 1, type = filterType) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/activities?page=${page}&limit=20&type=${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setActivities(response.data.activities);
            setTotalPages(response.data.pagination.pages);
            setTotalActivities(response.data.pagination.total);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch activities. Please try again later.');
            setLoading(false);
            console.error('Error fetching activities:', err);
        }
    };

    useEffect(() => {
        fetchActivities(currentPage, filterType);
    }, [currentPage, filterType]);

    const handleFilterChange = (type) => {
        setFilterType(type);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement search functionality if needed
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'login':
                return '🔐';
            case 'property':
                return '🏠';
            case 'order':
                return '📦';
            case 'user':
                return '👤';
            default:
                return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'login':
                return 'bg-blue-100 text-blue-800';
            case 'property':
                return 'bg-green-100 text-green-800';
            case 'order':
                return 'bg-purple-100 text-purple-800';
            case 'user':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => fetchActivities()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="mr-4 text-gray-600 hover:text-gray-800"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold">Activity Log</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-4 py-2 rounded-full ${
                                filterType === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleFilterChange('login')}
                            className={`px-4 py-2 rounded-full ${
                                filterType === 'login'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Logins
                        </button>
                        <button
                            onClick={() => handleFilterChange('property')}
                            className={`px-4 py-2 rounded-full ${
                                filterType === 'property'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Properties
                        </button>
                        <button
                            onClick={() => handleFilterChange('order')}
                            className={`px-4 py-2 rounded-full ${
                                filterType === 'order'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => handleFilterChange('user')}
                            className={`px-4 py-2 rounded-full ${
                                filterType === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Users
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activities.map((activity) => (
                                <tr key={activity._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                                            {getActivityIcon(activity.type)} {activity.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{activity.action}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{activity.user?.name || 'System'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {activities.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No activities found</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                    currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                Previous
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        currentPage === i + 1
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                    currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Showing {activities.length} of {totalActivities} activities
                </div>
            </div>
        </div>
    );
};

export default ActivitiesPage; 