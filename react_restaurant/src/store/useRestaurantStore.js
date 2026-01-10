import { create } from 'zustand';
import { api } from '../services/api';

export const useRestaurantStore = create((set) => ({
  restaurants: [],
  selectedRestaurant: null,
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

  fetchRestaurantById: async (restId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.getRestaurantById(restId);
      set({ selectedRestaurant: data, isLoading: false });
      return data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      set({ isLoading: false });
      throw error;
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
