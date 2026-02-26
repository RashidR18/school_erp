import axios from "axios";
import { toast } from "react-toastify"; // Assuming react-toastify is installed

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// send token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor for centralized error handling
API.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.message;
      toast.error(message); // Display error message as a toast
      console.error("API Error:", error.response.status, message);

      // Specific handling for 401 Unauthorized errors (e.g., redirect to login)
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        // Optionally, redirect to login page if not already there
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("No response from server. Please try again later.");
      console.error("API Error: No response received", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("An unexpected error occurred. Please try again.");
      console.error("API Error:", error.message);
    }
    return Promise.reject(error); // Re-throw the error so components can still catch it
  }
);

export default API;
