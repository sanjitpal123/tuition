import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tuition-backend-rayk.onrender.com/api', // Pointing to your Node.js backend
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tutorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const studentApi = axios.create({
  baseURL: 'https://tuition-backend-rayk.onrender.com/api',
});

studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
