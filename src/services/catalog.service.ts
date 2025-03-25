
import { toast } from "sonner";
import { apiClient } from "./api.service";
import { API_ENDPOINTS } from "@/config/api";

// Define course interface for catalog
export interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image?: string;
  author: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  category: string;
  rating: number;
  reviewCount: number;
  totalLectures: number;
  totalDuration: number; // in minutes
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  topics: string[];
  updatedAt: string;
}

export interface CatalogSearchResult {
  courses: CatalogCourse[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

const MOCK_COURSES: CatalogCourse[] = [
  {
    id: "1",
    title: "JavaScript Fundamentals for Beginners",
    description: "Learn the core concepts of JavaScript programming from the ground up.",
    price: 9.99,
    originalPrice: 19.99,
    image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_1280.png",
    author: {
      id: "a1",
      name: "John Developer",
    },
    category: "Web Development",
    rating: 4.5,
    reviewCount: 234,
    totalLectures: 42,
    totalDuration: 320,
    level: "beginner",
    topics: ["JavaScript", "Web Development", "Programming"],
    updatedAt: "2023-08-15T10:30:00Z",
  },
  {
    id: "2",
    title: "React.js - The Complete Guide",
    description: "Master React.js and build powerful, responsive web applications.",
    price: 12.99,
    originalPrice: 24.99,
    image: "https://cdn.pixabay.com/photo/2018/05/08/21/28/react-3384873_1280.png",
    author: {
      id: "a2",
      name: "Sarah Frontend",
    },
    category: "Web Development",
    rating: 4.8,
    reviewCount: 512,
    totalLectures: 65,
    totalDuration: 480,
    level: "intermediate",
    topics: ["React", "JavaScript", "Web Development"],
    updatedAt: "2023-09-10T14:20:00Z",
  },
  {
    id: "3",
    title: "Python for Data Science",
    description: "Learn how to use Python for data analysis, visualization, and machine learning.",
    price: 14.99,
    originalPrice: 29.99,
    image: "https://cdn.pixabay.com/photo/2013/07/11/04/30/python-143733_1280.png",
    author: {
      id: "a3",
      name: "Mark DataPro",
    },
    category: "Data Science",
    rating: 4.7,
    reviewCount: 378,
    totalLectures: 58,
    totalDuration: 520,
    level: "all-levels",
    topics: ["Python", "Data Science", "Machine Learning"],
    updatedAt: "2023-07-25T08:45:00Z",
  },
  {
    id: "4",
    title: "Node.js Backend Development",
    description: "Build scalable backend systems with Node.js, Express, and MongoDB.",
    price: 11.99,
    originalPrice: 22.99,
    image: "https://cdn.pixabay.com/photo/2015/04/23/17/41/node-js-736399_1280.png",
    author: {
      id: "a4",
      name: "David Backend",
    },
    category: "Web Development",
    rating: 4.6,
    reviewCount: 295,
    totalLectures: 50,
    totalDuration: 390,
    level: "intermediate",
    topics: ["Node.js", "Express", "MongoDB", "Backend Development"],
    updatedAt: "2023-06-05T16:15:00Z",
  },
  {
    id: "5",
    title: "UI/UX Design Principles",
    description: "Learn modern UI/UX design principles and create beautiful user experiences.",
    price: 13.99,
    originalPrice: 27.99,
    image: "https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582747_1280.png",
    author: {
      id: "a5",
      name: "Lisa Designer",
    },
    category: "Design",
    rating: 4.9,
    reviewCount: 412,
    totalLectures: 38,
    totalDuration: 280,
    level: "all-levels",
    topics: ["UI Design", "UX Design", "Figma", "Adobe XD"],
    updatedAt: "2023-05-12T11:30:00Z",
  },
  {
    id: "6",
    title: "AWS Certified Solutions Architect",
    description: "Prepare for the AWS Solutions Architect certification with hands-on practice.",
    price: 19.99,
    originalPrice: 39.99,
    image: "https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582747_1280.png",
    author: {
      id: "a6",
      name: "Michael Cloud",
    },
    category: "Cloud Computing",
    rating: 4.8,
    reviewCount: 520,
    totalLectures: 72,
    totalDuration: 620,
    level: "advanced",
    topics: ["AWS", "Cloud Computing", "Solutions Architecture"],
    updatedAt: "2023-04-20T09:45:00Z",
  },
];

export const catalogService = {
  /**
   * Search for courses in the catalog
   */
  async searchCourses(query: string, page: number = 1, limit: number = 10): Promise<CatalogSearchResult> {
    try {
      return await apiClient.get<CatalogSearchResult>(`${API_ENDPOINTS.catalog.search(query)}&page=${page}&limit=${limit}`);
    } catch (error) {
      console.error("Error searching courses:", error);
      // Return mock data in case of error
      const filteredCourses = MOCK_COURSES.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
      );
      
      return {
        courses: filteredCourses.slice((page - 1) * limit, page * limit),
        totalResults: filteredCourses.length,
        currentPage: page,
        totalPages: Math.ceil(filteredCourses.length / limit)
      };
    }
  },

  /**
   * Get all courses in the catalog
   */
  async getAllCourses(page: number = 1, limit: number = 10): Promise<CatalogSearchResult> {
    try {
      return await apiClient.get<CatalogSearchResult>(`${API_ENDPOINTS.catalog.getAll}?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error("Error getting all courses:", error);
      // Return mock data in case of error
      return {
        courses: MOCK_COURSES.slice((page - 1) * limit, page * limit),
        totalResults: MOCK_COURSES.length,
        currentPage: page,
        totalPages: Math.ceil(MOCK_COURSES.length / limit)
      };
    }
  },
  
  /**
   * Get featured courses
   */
  async getFeaturedCourses(): Promise<CatalogCourse[]> {
    try {
      return await apiClient.get<CatalogCourse[]>(API_ENDPOINTS.catalog.featured);
    } catch (error) {
      console.error("Error getting featured courses:", error);
      // Return mock data in case of error - first 4 courses as featured
      return MOCK_COURSES.slice(0, 4);
    }
  },
  
  /**
   * Get recommended courses for the current user
   */
  async getRecommendedCourses(): Promise<CatalogCourse[]> {
    try {
      return await apiClient.get<CatalogCourse[]>(API_ENDPOINTS.catalog.recommended);
    } catch (error) {
      console.error("Error getting recommended courses:", error);
      // Return mock data in case of error - last 4 courses as recommended
      return MOCK_COURSES.slice(2, 6);
    }
  },

  /**
   * Get course details by ID
   */
  async getCourseById(id: string): Promise<CatalogCourse | null> {
    try {
      return await apiClient.get<CatalogCourse>(`${API_ENDPOINTS.courses.getById(id)}`);
    } catch (error) {
      console.error(`Error getting course with ID ${id}:`, error);
      // Return mock data in case of error
      const course = MOCK_COURSES.find(c => c.id === id);
      return course || null;
    }
  },
};
