import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async action to add property
export const addProperty = createAsyncThunk(
  "property/addProperty",
  async (propertyData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState(); // Get authentication state
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const { data } = await axios.post("/api/properties", propertyData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

const propertySlice = createSlice({
  name: "property",
  initialState: { properties: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties.push(action.payload);
      })
      .addCase(addProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default propertySlice.reducer;
