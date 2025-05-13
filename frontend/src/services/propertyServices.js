import axios from "axios";

const API_URL = "http://localhost:3001/api/properties";

export const fetchUserProperties = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const deleteProperty = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};
