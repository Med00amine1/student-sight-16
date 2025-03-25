
import { apiClient } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profilePicture?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Service for handling authentication with Flask backend
 */
export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials);
      
      // Store token in localStorage for future requests
      localStorage.setItem('token', response.token);
      
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage even if the API call fails
      localStorage.removeItem('token');
    }
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiClient.get<User>(API_ENDPOINTS.auth.me);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
};

// Add to index.ts to make it available through barrel export
export * from './auth.service';
