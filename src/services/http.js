
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data; 
    const detail = data?.detail|| data?.message || data?.error || error.message;
    const err = new Error(detail || 'Request failed');
    err.status = status;
    err.data = data;
    throw err;
  }
);

export default http;
