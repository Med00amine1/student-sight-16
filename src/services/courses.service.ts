
import { Course } from '@/lib/mock-data';
import { apiClient } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

/**
 * Service for managing course-related API requests
 */
export const courseService = {
  /**
   * Fetch all courses
   */
  async getAllCourses(): Promise<Course[]> {
    try {
      return await apiClient.get<Course[]>(API_ENDPOINTS.courses.getAll);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to mock data in case the API is not available
      const { courses } = await import('@/lib/mock-data');
      toast.warning('Using mock data: API connection failed');
      return courses;
    }
  },
  
  /**
   * Fetch a course by ID
   */
  async getCourseById(id: string): Promise<Course | null> {
    try {
      return await apiClient.get<Course>(API_ENDPOINTS.courses.getById(id));
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      // Fallback to mock data in case the API is not available
      const { fetchCourseById } = await import('@/lib/mock-data');
      const course = await fetchCourseById(id);
      if (course) toast.warning('Using mock data: API connection failed');
      return course;
    }
  },
  
  /**
   * Create a new course
   */
  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    return apiClient.post<Course>(API_ENDPOINTS.courses.create, course);
  },
  
  /**
   * Update an existing course
   */
  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    return apiClient.put<Course>(API_ENDPOINTS.courses.update(id), course);
  },
  
  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.courses.delete(id));
  }
};
