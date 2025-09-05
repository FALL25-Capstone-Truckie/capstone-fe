import axios from "axios";
import { API_URL, API_TIMEOUT, AUTH_TOKEN_KEY } from "../config";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    console.log("Attaching token to request:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized - Token expired or invalid");
      console.log("Error details:", error.response);
      console.log("Request URL:", error.config?.url);
      console.log("Current token:", localStorage.getItem(AUTH_TOKEN_KEY));

      // TEMPORARILY DISABLED: Auto logout to debug
      // Call global token expired handler if available
      // if ((window as any).handleTokenExpired) {
      //   (window as any).handleTokenExpired();
      // } else {
      //   // Fallback: clear storage and redirect
      //   localStorage.removeItem(AUTH_TOKEN_KEY);
      //   localStorage.removeItem("user_data");
      //   window.location.href = "/login";
      // }
    }
    return Promise.reject(error);
  }
);

export default api;
