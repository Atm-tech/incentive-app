const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000"; // fallback to localhost if env is undefined

export default API_BASE_URL;
