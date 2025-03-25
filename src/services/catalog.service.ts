
import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './api.service';
import { toast } from 'sonner';

export interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image?: string;
  enrolledCount?: number;
  duration?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CatalogSearchResult {
  courses: CatalogCourse[];
  total: number;
  page: number;
  totalPages: number;
}

export const catalogService = {
  /**
   * Search for courses
   */
  async searchCourses(query: string, page = 1, limit = 10): Promise<CatalogSearchResult> {
    try {
      const result = await apiClient.get<CatalogSearchResult>(
        `${API_ENDPOINTS.catalog.search(query)}&page=${page}&limit=${limit}`
      );
      return result;
    } catch (error) {
      console.error('Error searching courses:', error);
      toast.warning('Using mock data: API connection failed');
      // Return empty result set on error
      return {
        courses: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  },

  /**
   * Get all catalog courses
   */
  async getAllCourses(page = 1, limit = 10): Promise<CatalogSearchResult> {
    try {
      const result = await apiClient.get<CatalogSearchResult>(
        `${API_ENDPOINTS.catalog.getAll}?page=${page}&limit=${limit}`
      );
      return result;
    } catch (error) {
      console.error('Error fetching all catalog courses:', error);
      toast.warning('Using mock data: API connection failed');
      // Return empty result set on error
      return {
        courses: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  },

  /**
   * Get featured courses
   */
  async getFeaturedCourses(): Promise<CatalogCourse[]> {
    try {
      const result = await apiClient.get<CatalogCourse[]>(API_ENDPOINTS.catalog.featured);
      return result;
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      toast.warning('Using mock data: API connection failed');
      return [];
    }
  },

  /**
   * Get recommended courses
   */
  async getRecommendedCourses(): Promise<CatalogCourse[]> {
    try {
      const result = await apiClient.get<CatalogCourse[]>(API_ENDPOINTS.catalog.recommended);
      return result;
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      toast.warning('Using mock data: API connection failed');
      return [];
    }
  },

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<CatalogCourse | null> {
    try {
      const result = await apiClient.get<CatalogCourse>(`${API_ENDPOINTS.catalog.getAll}/${id}`);
      return result;
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      toast.warning('Using mock data: API connection failed');
      return null;
    }
  }
};
