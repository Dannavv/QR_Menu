import { create } from 'zustand';
import { api } from '../services/api'; // Fixed import

export const useProductStore = create((set, get) => ({
  products: [],
  activeProduct: null,
  isLoading: false,

  fetchProducts: async (rest_id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.getProducts(rest_id);
      set({ products: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ isLoading: false });
    }
  },

  readProduct: async (product_id) => {
    try {
      const { data } = await api.getProductDetails(product_id);
      set({ activeProduct: data });
    } catch (error) {
      console.error('Error reading product:', error);
    }
  },

// Inside useProductStore.js
toggleAvailability: async (product_id, current_available) => { // Added current status param
  try {
    // We send the OPPOSITE of current availability to the API
    const { data } = await api.updateAvailability(product_id, !current_available);
    set((state) => ({
      products: state.products.map((p) => 
        p.id === product_id ? { ...p, available: data.available } : p
      )
    }));
  } catch (error) {
    console.error('Error updating availability:', error);
  }
},

  uploadImage: async (product_id, file) => {
    try {
      const { data } = await api.uploadProductImage(product_id, file);
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}));