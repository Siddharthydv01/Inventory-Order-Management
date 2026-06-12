import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Products ──────────────────────────────────────────────────
export const productAPI = {
  getAll: (search = '') => api.get(`/products/?search=${search}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Customers ─────────────────────────────────────────────────
export const customerAPI = {
  getAll: (search = '') => api.get(`/customers/?search=${search}`),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// ─── Orders ────────────────────────────────────────────────────
export const orderAPI = {
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders/', data),
};

export default api;
