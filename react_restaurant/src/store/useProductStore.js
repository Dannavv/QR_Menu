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

  updateAvailability: async (product_id, available) => {
    try {
      const { data } = await api.updateAvailability(product_id, available);
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