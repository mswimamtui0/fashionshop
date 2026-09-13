import axios from 'axios';

// Resolve API base URL:
//  1. Prefer VITE_API_URL (set on Vercel/hosting)
//  2. Fall back to production backend when not on localhost
//  3. Use localhost during development
const baseURL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://fashionshop1.onrender.com/api');

const api = axios.create({ baseURL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
