import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Check both storage methods to ensure the token is always found
    const localToken = localStorage.getItem('admin-token');
    const cookieToken = Cookies.get('token');
    
    // Prefer the newer localToken from your unified Auth page
    const activeToken = localToken || cookieToken;

    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }
  }
  return config;
});

export default api;