
// API configuration for Flask backend

// Base URL for API requests
export const API_BASE_URL = "http://localhost:5000/api";

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    me: `${API_BASE_URL}/auth/me`,
    switchMode: `${API_BASE_URL}/auth/switch-mode`,
  },
  courses: {
    getAll: `${API_BASE_URL}/courses`,
    getById: (id: string) => `${API_BASE_URL}/courses/${id}`,
    create: `${API_BASE_URL}/courses`,
    update: (id: string) => `${API_BASE_URL}/courses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/courses/${id}`,
    purchased: `${API_BASE_URL}/courses/purchased`,
    enroll: (id: string) => `${API_BASE_URL}/courses/${id}/enroll`,
    content: (id: string) => `${API_BASE_URL}/courses/${id}/content`,
    
    // Course player specific endpoints
    completeLecture: (id: string) => `${API_BASE_URL}/courses/${id}/complete-lecture`,
    saveNotes: (id: string) => `${API_BASE_URL}/courses/${id}/save-notes`,
    askQuestion: (id: string) => `${API_BASE_URL}/courses/${id}/ask-question`,
    submitQuiz: (id: string) => `${API_BASE_URL}/courses/${id}/submit-quiz`,
    trackProgress: (id: string) => `${API_BASE_URL}/courses/${id}/track-progress`,
    getCertificate: (id: string) => `${API_BASE_URL}/courses/${id}/certificate`,
  },
  students: {
    getAll: `${API_BASE_URL}/students`,
    getByCourse: (courseId: string) => `${API_BASE_URL}/courses/${courseId}/students`,
  },
  metrics: {
    getAll: `${API_BASE_URL}/metrics`,
  },
  catalog: {
    getAll: `${API_BASE_URL}/catalog/courses`,
    search: (query: string) => `${API_BASE_URL}/catalog/search?q=${encodeURIComponent(query)}`,
    featured: `${API_BASE_URL}/catalog/featured`,
    recommended: `${API_BASE_URL}/catalog/recommended`,
  }
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;
