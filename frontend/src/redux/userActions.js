// userActions.js
import axios from 'axios';
import { toast } from 'react-toastify';

export const fetchAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: 'USER_LIST_REQUEST' });
    const { data } = await axios.get('/api/admin/users');
    dispatch({ type: 'USER_LIST_SUCCESS', payload: data });
  } catch (error) {
    dispatch({ 
      type: 'USER_LIST_FAIL', 
      payload: error.response?.data?.message || error.message 
    });
    toast.error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: 'USER_DELETE_REQUEST' });
    await axios.delete(`/api/admin/users/${userId}`);
    dispatch({ type: 'USER_DELETE_SUCCESS' });
    toast.success('User deleted successfully');
  } catch (error) {
    dispatch({ 
      type: 'USER_DELETE_FAIL', 
      payload: error.response?.data?.message || error.message 
    });
    toast.error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const updateUserRole = (userId, role) => async (dispatch) => {
  try {
    dispatch({ type: 'USER_UPDATE_ROLE_REQUEST' });
    const { data } = await axios.put(`/api/admin/users/${userId}/role`, { role });
    dispatch({ type: 'USER_UPDATE_ROLE_SUCCESS', payload: data });
    toast.success('User role updated successfully');
  } catch (error) {
    dispatch({ 
      type: 'USER_UPDATE_ROLE_FAIL', 
      payload: error.response?.data?.message || error.message 
    });
    toast.error(error.response?.data?.message || 'Failed to update user role');
  }
};

export const updateUserStatus = (userId, status) => async (dispatch) => {
  try {
    dispatch({ type: 'USER_UPDATE_STATUS_REQUEST' });
    const { data } = await axios.put(`/api/admin/users/${userId}/status`, { status });
    dispatch({ type: 'USER_UPDATE_STATUS_SUCCESS', payload: data });
    toast.success('User status updated successfully');
  } catch (error) {
    dispatch({ 
      type: 'USER_UPDATE_STATUS_FAIL', 
      payload: error.response?.data?.message || error.message 
    });
    toast.error(error.response?.data?.message || 'Failed to update user status');
  }
};