import { create } from 'zustand';
import authService from '../services/auth.service';

const useAuthStore = create((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout
  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
