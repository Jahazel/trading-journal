import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

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

export { api, getEntries, getEntry };
