import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 JWT Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- AUTH ----------------
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ---------------- EXPENSE ----------------
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  add: (data) => api.post('/expenses', data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// ---------------- RECEIPT OCR ----------------
export const receiptAPI = {
  upload: (formData) =>
    axios.post(`${API_BASE_URL}/upload-receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),
};

// ---------------- INSIGHTS ----------------
export const insightAPI = {
  get: () => api.get('/insights'),
  predict: () => api.get('/predict'),
};

// ---------------- BUDGET ----------------
export const budgetAPI = {
  getAll: () => api.get('/budget'),
  set: (data) => api.post('/budget', data),
};

// ---------------- 🤖 GENAI (GEMINI) ----------------
export const genAIAPI = {
  getSummary: () => api.get('/genai/summary'),
};

export default api;
