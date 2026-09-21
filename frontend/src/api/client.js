import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available & properly handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let browser/Axios compute multipart/form-data boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized / 403 Forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token on 401/403 if not on login/register
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
};

export const resumeApi = {
  uploadResume: (formData) => api.post('/api/resume/upload', formData, {
    headers: { 'Content-Type': undefined },
  }),
};

export const analysisApi = {
  analyze: (data) => api.post('/api/analyze', data),
  getHistory: () => api.get('/api/analyze/history'),
  getById: (id) => api.get(`/api/analyze/${id}`),
};

export const jdApi = {
  uploadJdFile: (formData) => api.post('/api/jd/upload', formData, {
    headers: { 'Content-Type': undefined },
  }),
};

export const trendsApi = {
  getAll: () => api.get('/api/trends'),
  refresh: () => api.post('/admin/refresh-trends'),
};

export default api;
