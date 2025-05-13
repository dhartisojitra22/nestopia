import { createSlice } from "@reduxjs/toolkit";

// Define the initial state
const initialState = {
  user: null, // Store user data after login
  token: null, // Store JWT token
  role: null, // Store user role
  isAuthenticated: false, // Track authentication status
};

// Create a slice for authentication
const authSlice = createSlice({
  name: "auth", // Ensure the slice name is 'auth'
  initialState,
  reducers: {
    // Action to set user data after login
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
    },
    // Action to clear user data on logout
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

// Export actions
export const { setCredentials, clearCredentials } = authSlice.actions;

// Export reducer
export default authSlice.reducer;