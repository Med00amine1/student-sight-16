
import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './api.service';
import { toast } from 'sonner';
import { courses } from '@/lib/mock-data'; // Import mock courses

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

// Convert mock courses to catalog courses
const convertMockToCatalog = (): CatalogCourse[] => {
  return courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: "John Doe",
    price: course.price || 49.99,
    originalPrice: course.originalPrice,
    rating: course.rating || 4.5,
    reviewCount: course.reviewCount || 50,
    image: course.cover,
    enrolledCount: course.enrolled,
    category: course.category,
    level: 'intermediate'
  }));
};

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
      
      // Return mock data filtered by query
      const mockCatalogCourses = convertMockToCatalog();
      const filteredCourses = mockCatalogCourses.filter(
        course => course.title.toLowerCase().includes(query.toLowerCase()) || 
                 course.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        courses: filteredCourses,
        total: filteredCourses.length,
        page: 1,
        totalPages: 1
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
      
      // Return mock data
      const mockCatalogCourses = convertMockToCatalog();
      
      return {
        courses: mockCatalogCourses,
        total: mockCatalogCourses.length,
        page: 1,
        totalPages: 1
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
      return convertMockToCatalog();
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
      return convertMockToCatalog();
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
      
      // Return mock course by ID
      const mockCatalogCourses = convertMockToCatalog();
      return mockCatalogCourses.find(course => course.id === id) || null;
    }
  }
};
