import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const userAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isCheckingAuth: true,

  signup: async (userName, password) => {
    set({ error: null });

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
    const token = localStorage.getItem('token');
    console.log('Checking auth, token found:', token); // Debug log
    if (token) {
      console.log('1');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('2');
      try {
        console.log('3');
        const response = await axios.get(`${API_URL}/check-auth`);
        console.log('4');
        set({
          user: response.data.user,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
        console.log('User authenticated:', response.data.user); // Debug log
      } catch (error) {
        console.error('Error checking auth:', error); // Debug log
        set({
          error: null,
          isCheckingAuth: false,
          isAuthenticated: false,
        });
        localStorage.removeItem('token'); // Clear invalid token
      }
    } else {
      set({ isCheckingAuth: false, isAuthenticated: false });
      console.log('No token found, user is not authenticated'); // Debug log
    }
  },

  login: async (userName, password) => {
    set({ error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        userName,
        password,
      });

      console.log('Response from backend:', response.data); // Log the full response

      const { user } = response.data; // Extract user from response data
      const token = user.token; // Extract token from user object

      if (token) {
        localStorage.setItem('token', token); // Save token to localStorage
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header for future requests

        set({
          isAuthenticated: true,
          user: user,
          error: null,
        });
      } else {
        console.error('Token is undefined');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error logging in',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      set({ error: 'Error logging out' });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
}));
