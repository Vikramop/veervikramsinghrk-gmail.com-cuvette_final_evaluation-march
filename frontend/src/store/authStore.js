import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

export const userAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  //   isLoading: false,
  isCheckingAuth: true,

  signup: async (userName, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/signup`, {
        userName,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('response', response.data);
      return response;
    } catch (error) {
      set({
        error: error.response.data.message || 'Error signing up',
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  login: async (userName, password) => {
    set({ error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        userName,
        password,
      });
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error logging in',
        isAuthenticated: false,
      });
      throw error;
    }
  },
}));
