// frontend/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://incentive-backend-kgpj.onrender.com",
  timeout: 10000,
  // any other defaults…
});

export default api;
