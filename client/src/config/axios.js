import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // Update the base URL for your backend API
  withCredentials: true, // Allows sending cookies (e.g., session cookies) with requests
  headers: {
    "Content-Type": "application/json", // Ensures that requests send JSON payload
  },
});

let isRefreshing = false;

// Interceptor to handle response errors, especially for token expiration
axiosInstance.interceptors.response.use(
  (response) => response, // Pass the response if it's successful
  async (error) => {
    const originalRequest = error.config;

    // If the response status is 401 (Unauthorized) and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Prevent multiple refresh token requests
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt to refresh the access token
          await axiosInstance.post('/user/refresh-token');
          isRefreshing = false;
          return axiosInstance(originalRequest); // Retry the original request
        } catch (refreshError) {
          // If refreshing the token fails, remove the user data and redirect to login
          localStorage.removeItem('user');
          window.location.href = '/login'; // Redirect user to login page
          return Promise.reject(refreshError); // Reject the original request
        }
      }
    }

    return Promise.reject(error); // Reject the error if it doesn't need token refresh
  }
);

export default axiosInstance;
