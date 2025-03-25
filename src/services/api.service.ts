
import { REQUEST_TIMEOUT } from '@/config/api';

/**
 * Simple API client with standard methods for interacting with the Flask backend
 */
export const apiClient = {
  /**
   * Performs a GET request
   */
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      signal: getTimeoutSignal(),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Performs a POST request
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: getTimeoutSignal(),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Performs a PUT request
   */
  async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: getTimeoutSignal(),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Performs a DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      signal: getTimeoutSignal(),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
};

/**
 * Get headers for API requests including authentication token if available
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Add authentication token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Create an AbortSignal that will timeout after specified duration
 */
function getTimeoutSignal(): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  return controller.signal;
}
