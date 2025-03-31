import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://chat-app-with-ai-and-code-editor.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;