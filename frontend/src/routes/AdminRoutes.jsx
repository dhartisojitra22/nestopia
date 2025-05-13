import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../components/admin/AdminDashboard ";
import AdminApprovalPage from "../components/admin/AdminApprovalPage";
import ProtectedAdminRoute from "./ProtectedAdminRoute ";
import UserManagement from "../components/admin/UserManagement";
import RejectedPropertiesPage from "../components/admin/RejectedPropertiesPage";
import AdminMessages from "../components/admin/ContactMessages";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="approvals" element={<AdminApprovalPage />} />
        {/* <Route path="users" element={<div>User Management</div>} /> */}
        <Route path="users" element={<UserManagement />} />
        <Route path="rejected" element={<RejectedPropertiesPage />} />
        <Route path="contactmsg" element={<AdminMessages/>}/>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;