
import { Student } from '@/lib/mock-data';
import { apiClient } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

/**
 * Service for managing student-related API requests
 */
export const studentService = {
  /**
   * Fetch all students
   */
  async getAllStudents(): Promise<Student[]> {
    try {
      return await apiClient.get<Student[]>(API_ENDPOINTS.students.getAll);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to mock data in case the API is not available
      const { students } = await import('@/lib/mock-data');
      toast.warning('Using mock data: API connection failed');
      return students;
    }
  },
  
  /**
   * Fetch students by course ID
   */
  async getStudentsByCourse(courseId: string): Promise<Student[]> {
    try {
      return await apiClient.get<Student[]>(API_ENDPOINTS.students.getByCourse(courseId));
    } catch (error) {
      console.error(`Error fetching students for course ${courseId}:`, error);
      // Fallback to mock data in case the API is not available
      const { fetchStudentsByCourse } = await import('@/lib/mock-data');
      const students = await fetchStudentsByCourse(courseId);
      toast.warning('Using mock data: API connection failed');
      return students;
    }
  }
};
