import axios from 'axios';

// Use relative URLs - will go through nginx proxy
const api = axios.create({
  baseURL: '/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getFeatured = () => api.get('/products/featured');
export const getCategories = () => api.get('/products/categories');
export const seedProducts = () => api.get('/products/seed');
export const addReview = (id, data) => api.post(`/products/${id}/reviews`, data);
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my');
export const getOrder = (id) => api.get(`/orders/${id}`);

export default api;
