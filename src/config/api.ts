
// API configuration for Flask backend

// Base URL for API requests
export const API_BASE_URL = "http://localhost:5000/api";

// API endpoints
export const API_ENDPOINTS = {
  courses: {
    getAll: `${API_BASE_URL}/courses`,
    getById: (id: string) => `${API_BASE_URL}/courses/${id}`,
    create: `${API_BASE_URL}/courses`,
    update: (id: string) => `${API_BASE_URL}/courses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/courses/${id}`,
  },
  students: {
    getAll: `${API_BASE_URL}/students`,
    getByCourse: (courseId: string) => `${API_BASE_URL}/courses/${courseId}/students`,
  },
  metrics: {
    getAll: `${API_BASE_URL}/metrics`,
  }
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;
