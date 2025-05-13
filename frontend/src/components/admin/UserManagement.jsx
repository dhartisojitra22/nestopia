import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  FaEdit, FaTrash, FaSearch, FaUserAltSlash, 
  FaUserCheck, FaUser
} from "react-icons/fa";

const UserManagement = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/user/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to fetch users",
        });
      }
    };

    if (token && user?.email === 'admin@gmail.com') {
      fetchUsers();
    }
  }, [token, user]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/user/admin/users/${userId}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "User Updated!",
          text: "User details have been updated successfully.",
          showConfirmButton: false,
          timer: 1500
        });
        setUsers(users.map(user => 
          user._id === userId ? { ...user, ...editForm } : user
        ));
        setEditingUserId(null);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        text: error.response?.data?.message || "Failed to update user.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://localhost:3001/user/admin/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "User Deleted!",
            text: "The user has been deleted successfully.",
            showConfirmButton: false,
            timer: 1500
          });
          setUsers(users.filter(user => user._id !== userId));
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed!",
          text: error.response?.data?.message || "Failed to delete user.",
        });
      }
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (user?.email !== 'admin@gmail.com') {
    return (
      <div className="container-fluid px-4 py-4 text-center">
        <h3>Access Denied</h3>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-5">Loading users...</div>;

  return (
    <div className="container-fluid px-4 py-4">
      <h2 className="mb-4">User Management</h2>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text"><FaSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="text-muted">No users found</div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="py-3 px-4">
                        {editingUserId === user._id ? (
                          <div className="d-flex gap-2">
                            <input
                              type="text"
                              name="firstName"
                              value={editForm.firstName}
                              onChange={handleEditChange}
                              className="form-control form-control-sm"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              name="lastName"
                              value={editForm.lastName}
                              onChange={handleEditChange}
                              className="form-control form-control-sm"
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                          `${user.firstName} ${user.lastName}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingUserId === user._id ? (
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex gap-3">
                          {editingUserId === user._id ? (
                            <>
                              <button
                                onClick={() => handleEditSubmit(user._id)}
                                className="btn btn-link text-success p-0"
                                title="Save"
                              >
                                <FaCheck size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="btn btn-link text-secondary p-0"
                                title="Cancel"
                              >
                                <FaTimes size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(user)}
                                className="btn btn-link p-0"
                                style={{color: 'rgb(8, 8, 131)'}}
                                title="Edit"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="btn btn-link text-danger p-0"
                                title="Delete"
                              >
                                <FaTrash size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;