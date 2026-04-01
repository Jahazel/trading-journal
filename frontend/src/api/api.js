import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

const signup = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);

    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

const getEntries = async () => {
  try {
    const response = await api.get("/trades");

    return response.data;
  } catch (error) {
    console.error("Error fetching jountal entries:", error);
    throw error;
  }
};

const getEntry = async (id) => {
  try {
    const response = await api.get(`/trades/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching jountal entry:", error);
    throw error;
  }
};

const createEntry = async (tradeData) => {
  try {
    const response = await api.post("/trades", tradeData);

    return response.data;
  } catch (error) {
    console.error("Error saving jountal entry:", error);
    throw error;
  }
};

const updateEntry = async ({ id, ...fields }) => {
  try {
    const response = await api.patch(`/trades/${id}`, fields);

    return response.data;
  } catch (error) {
    console.error("Error updating trade entry:", error);
    throw error;
  }
};

const deleteEntry = async (id) => {
  try {
    const response = await api.delete(`/trades/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error deleting trade entry:", error);
  }
};

export {
  login,
  signup,
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
};
