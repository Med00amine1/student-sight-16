import { apiClient } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profilePicture?: string;
  purchasedCourses?: string[]; // IDs of courses the user has purchased
  isTeacher: boolean; // Flag to check if user has teacher access
}

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
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
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response.user;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // More specific error message
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.register, userData);
      
      // Automatically log in the user after registration
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response.user;
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // More specific error message
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try a different email.';
      toast.error(errorMessage);
      
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
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get from localStorage to avoid unnecessary API calls
      const userJson = localStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      
      // If not in localStorage, fetch from API
      const user = await apiClient.get<User>(API_ENDPOINTS.auth.me);
      
      // Update localStorage with latest data
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
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
  },
  
  /**
   * Check if current user has teacher role
   */
  isTeacher(): boolean {
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;
    
    const user = JSON.parse(userJson) as User;
    return user.isTeacher || user.role === 'instructor' || user.role === 'admin';
  },
  
  /**
   * Switch between student and teacher mode
   * This doesn't actually change the user's role, just their current view
   */
  switchToTeacherMode(): void {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    
    const user = JSON.parse(userJson) as User;
    localStorage.setItem('viewMode', 'teacher');
  },
  
  switchToStudentMode(): void {
    localStorage.setItem('viewMode', 'student');
  },
  
  /**
   * Get current view mode (teacher or student)
   */
  getCurrentViewMode(): 'teacher' | 'student' {
    return localStorage.getItem('viewMode') as 'teacher' | 'student' || 'student';
  }
};
