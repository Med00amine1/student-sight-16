
import { Metric } from '@/lib/mock-data';
import { apiClient } from './api.service';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

/**
 * Service for managing metrics-related API requests
 */
export const metricService = {
  /**
   * Fetch all metrics
   */
  async getAllMetrics(): Promise<Metric[]> {
    try {
      return await apiClient.get<Metric[]>(API_ENDPOINTS.metrics.getAll);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Fallback to mock data in case the API is not available
      const { metrics } = await import('@/lib/mock-data');
      toast.warning('Using mock data: API connection failed');
      return metrics;
    }
  }
};
