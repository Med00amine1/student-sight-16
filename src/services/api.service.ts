
import { API_BASE_URL, REQUEST_TIMEOUT } from '@/config/api';
import { toast } from 'sonner';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * API client for making HTTP requests
 */
class ApiClient {
  /**
   * Fetch data from the API with timeout and error handling
   */
  async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const { timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;
    
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      // Parse JSON response
      return await response.json();
    } catch (error) {
      // Handle network errors, timeouts, and other issues
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Request timed out. Please try again.');
          throw new Error('Request timed out');
        }
        
        toast.error(`API request failed: ${error.message}`);
      }
      
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  /**
   * GET request
   */
  async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'GET' });
  }
  
  /**
   * POST request
   */
  async post<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(url, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * PUT request
   */
  async put<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(url, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data) 
    });
  }
  
  /**
   * DELETE request
   */
  async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
