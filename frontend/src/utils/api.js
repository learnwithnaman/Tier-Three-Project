import axios from 'axios';

export const getProducts = (params) => axios.get('/products', { params });
export const getProduct = (id) => axios.get(`/products/${id}`);
export const getFeatured = () => axios.get('/products/featured');
export const getCategories = () => axios.get('/products/categories');
export const seedProducts = () => axios.get('/products/seed');
export const addReview = (id, data) => axios.post(`/products/${id}/reviews`, data);
export const createOrder = (data) => axios.post('/orders', data);
export const getMyOrders = () => axios.get('/orders/my');
export const getOrder = (id) => axios.get(`/orders/${id}`);
