
import { apiClient } from './api.service';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

export interface CatalogCourse {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
}

/**
 * Service for managing catalog-related API requests
 */
export const catalogService = {
  /**
   * Fetch all courses for the catalog
   */
  async getCatalogCourses(): Promise<CatalogCourse[]> {
    try {
      return await apiClient.get<CatalogCourse[]>(API_ENDPOINTS.catalog.getAll);
    } catch (error) {
      console.error('Error fetching catalog courses:', error);
      // Fallback to mock data
      const mockCourses: CatalogCourse[] = [
        {
          id: "1",
          title: "Build a Connect-4 Clone in React + JavaScript",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 9.99,
          originalPrice: 19.99,
          rating: 4,
          reviewCount: 209
        },
        {
          id: "2",
          title: "React - Complete Developer Course with Hands-On",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 9.99,
          originalPrice: 48.49,
          rating: 4,
          reviewCount: 578
        },
        {
          id: "3",
          title: "Ultimate Front-End Bootcamp: CSS, Bootstrap, JS, React",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 9.99,
          originalPrice: 38.99,
          rating: 4,
          reviewCount: 349
        },
        {
          id: "4",
          title: "Python And Django Framework And HTML 5 Stack Complete Course",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 10.99,
          originalPrice: 54.99,
          rating: 4,
          reviewCount: 494
        },
        {
          id: "5",
          title: "Python & Django REST API Bootcamp",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 10.99,
          originalPrice: 54.99,
          rating: 4,
          reviewCount: 494
        },
        {
          id: "6",
          title: "Django 5 - Build a Complete Website from Scratch",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 9.99,
          originalPrice: 47.99,
          rating: 4,
          reviewCount: 197
        },
        {
          id: "7",
          title: "Python & Django: The Complete Django Web Development",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 9.99,
          originalPrice: 49.99,
          rating: 4,
          reviewCount: 939
        },
        {
          id: "8",
          title: "Django Essentials: Build and Deploy Real-World Apps",
          image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png",
          price: 9.99,
          originalPrice: 48.99,
          rating: 4,
          reviewCount: 21
        }
      ];
      toast.warning('Using mock data: API connection failed');
      return mockCourses;
    }
  },
  
  /**
   * Search courses in the catalog
   */
  async searchCatalogCourses(query: string): Promise<CatalogCourse[]> {
    try {
      return await apiClient.get<CatalogCourse[]>(API_ENDPOINTS.catalog.search(query));
    } catch (error) {
      console.error('Error searching catalog courses:', error);
      // Get all courses and filter them client-side as fallback
      const allCourses = await this.getCatalogCourses();
      const normalizedQuery = query.toLowerCase().trim();
      return allCourses.filter(course => 
        course.title.toLowerCase().includes(normalizedQuery)
      );
    }
  }
};
