import axios from "axios";

/*
Environment scenarios:

1. Production / configured environment
VITE_API_BASE_URL=https://api.yourdomain.com/api

2. Local development fallback
http://localhost:5000/api
*/

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000/api";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // prevent hanging requests
});


// ============================
// REQUEST INTERCEPTOR
// Adds JWT token automatically
// ============================

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);


// ============================
// RESPONSE INTERCEPTOR
// Handles global errors
// ============================

api.interceptors.response.use(
  (response) => response,

  (error) => {

    // NETWORK ERROR
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    // UNAUTHORIZED
    if (error.response.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // SERVER ERROR
    if (error.response.status >= 500) {
      console.error("Server Error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;