import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Products
export const productsApi = {
  getAll: () => apiClient.get('/products/'),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products/', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

// Customers
export const customersApi = {
  getAll: () => apiClient.get('/customers/'),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers/', data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

// Orders
export const ordersApi = {
  getAll: () => apiClient.get('/orders/'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders/', data),
  delete: (id) => apiClient.delete(`/orders/${id}`),
};

// Dashboard
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
};
