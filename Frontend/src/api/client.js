import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.status}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        const authStore = useAuthStore.getState();
        authStore.logout();
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      if (status >= 500) {
        console.error('Error del servidor:', error.response.data);
      }
    } else if (error.request) {
      console.error('Sin respuesta del servidor:', error.message);
    } else {
      console.error('Error de configuración:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default client;
