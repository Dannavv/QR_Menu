import { create } from 'zustand';
import { api } from '../services/api'; // Fixed import

export const useRestaurantStore = create((set) => ({
  restaurants: [],
  isLoading: false,

  fetchRestaurants: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.getRestaurants();
      set({ restaurants: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      set({ isLoading: false });
    }
  },

  createRestaurant: async (restaurantData) => {
    try {
      const { data } = await api.createRestaurant(restaurantData);
      set((state) => ({ restaurants: [...state.restaurants, data] }));
      return data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }
}));