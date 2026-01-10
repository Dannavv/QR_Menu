import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'http://3.110.185.186:8000',
  baseURL: 'http://3.110.185.186/api',
  // headers: { 'Content-Type': 'application/json' }
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
  // =========================
  // Auth
  // =========================
  login: (credentials) => apiClient.post('/auth/login', credentials),

  getPublicRestaurantProfile: (country, state, city, identifier) => 
    apiClient.get(`/api/v1/public/${country}/${state}/${city}/${identifier}`),

  // =========================
  // Restaurant Endpoints
  // =========================
  getRestaurants: () => apiClient.get('/api/v1/restaurants/'),

  getRestaurantById: (restaurantId) =>
    apiClient.get(`/api/v1/restaurants/${restaurantId}`),

  createRestaurant: (data) =>
    apiClient.post('/api/v1/restaurants/', data),

  updateRestaurant: (restaurantId, data) =>
    apiClient.patch(`/api/v1/restaurants/${restaurantId}`, data),

  deleteRestaurant: (restaurantId) =>
    apiClient.delete(`/api/v1/restaurants/${restaurantId}`),


  // =========================
  // Category Endpoints
  // =========================
  getCategories: () => apiClient.get('/api/v1/categories/'),

  createCategory: (data) =>
    apiClient.post('/api/v1/categories/', data),

  // =========================
  // Product Endpoints
  // =========================
  getProducts: (restId) =>
    apiClient.get(`/api/v1/restaurants/${restId}/products/`),

  createProduct: (restId, data) =>
    apiClient.post(`/api/v1/restaurants/${restId}/products/`, data),

  getProductDetails: (productId) =>
    apiClient.get(`/api/v1/products/${productId}`),

  updateProductDetails: (productId, data) =>
    apiClient.patch(`/api/v1/products/${productId}`, data),

  deleteProductImage: (imageId) =>
    apiClient.delete(`/api/v1/products/images/${imageId}`),




  // =========================
  // Availability
  // =========================
  updateAvailability: (productId, available) =>
    apiClient.patch(
      `/api/v1/products/${productId}/availability`,
      { available }
    ),

  // =========================
  // Image Upload
  // =========================

  updateProductImage: (productId, files) => {

    console.log(files)
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file); // MUST be "files"
    });

    return apiClient.post(
      `/api/v1/temp/products/${productId}/images/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          
        },
      }
    );
  }

};
