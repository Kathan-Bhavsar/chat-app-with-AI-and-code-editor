import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.VITE_API_URL || "http://localhost:8000", // Fallback URL
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
