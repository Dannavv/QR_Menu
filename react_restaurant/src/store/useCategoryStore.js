import { create } from 'zustand';
import { api } from '../services/api'; // Fixed import

export const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.getCategories();
      set({ categories: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ isLoading: false });
    }
  },

  createCategory: async (categoryData) => {
    try {
      const { data } = await api.createCategory(categoryData);
      set((state) => ({ categories: [...state.categories, data] }));
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
}));