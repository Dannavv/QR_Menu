import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Base URL (endpoints append /api/v1)
  headers: { 'Content-Type': 'application/json' }
});

// Automatically attach Token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // Restaurant Endpoints
  getRestaurants: () => apiClient.get('/api/v1/restaurants/'),
  createRestaurant: (data) => apiClient.post('/api/v1/restaurants/', data),
  
  // Category Endpoints
  getCategories: () => apiClient.get('/api/v1/categories/'),
  createCategory: (data) => apiClient.post('/api/v1/categories/', data),
  
  // Product Endpoints
  getProducts: (restId) => apiClient.get(`/api/v1/restaurants/${restId}/products/`),
  createProduct: (restId, data) => apiClient.post(`/api/v1/restaurants/${restId}/products/`, data),
  getProductDetails: (productId) => apiClient.get(`/api/v1/products/${productId}`),
  
  // Availability (Matches your PATCH route)
  updateAvailability: (productId, available) => 
    apiClient.patch(`/api/v1/products/${productId}/availability`, { available }),

  // Image Upload
  uploadProductImage: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/api/v1/products/${productId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};