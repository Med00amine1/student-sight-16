
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'draft';
  enrolled: number;
  cover: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  courseId: string;
  progress: number;
}

export interface Metric {
  label: string;
  value: number;
  change: number;
  icon: string;
}

// Mock course data
export const courses: Course[] = [
  {
    id: "c1",
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
    category: "Development",
    status: "active",
    enrolled: 128,
    cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop",
    price: 49.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviewCount: 87
  },
  {
    id: "c2",
    title: "Advanced React Techniques",
    description: "Master advanced React patterns, hooks, and performance optimization.",
    category: "Development",
    status: "active",
    enrolled: 87,
    cover: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=200&auto=format&fit=crop",
    price: 69.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 56
  },
  {
    id: "c3",
    title: "UX Design Fundamentals",
    description: "Learn the principles of user experience design and create intuitive interfaces.",
    category: "Design",
    status: "draft",
    enrolled: 0,
    cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=200&auto=format&fit=crop",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.5,
    reviewCount: 34
  },
  {
    id: "c4",
    title: "Data Science with Python",
    description: "Explore data analysis, visualization, and machine learning with Python.",
    category: "Data Science",
    status: "active",
    enrolled: 56,
    cover: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=200&auto=format&fit=crop",
    price: 79.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviewCount: 103
  },
  {
    id: "c5",
    title: "Mobile App Development with Flutter",
    description: "Build cross-platform mobile applications with Google's Flutter framework.",
    category: "Development",
    status: "active",
    enrolled: 42,
    cover: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=200&auto=format&fit=crop",
    price: 64.99,
    originalPrice: 119.99,
    rating: 4.6,
    reviewCount: 68
  },
  {
    id: "c6",
    title: "DevOps Fundamentals",
    description: "Learn CI/CD, containerization, and infrastructure as code for modern application deployment.",
    category: "DevOps",
    status: "active",
    enrolled: 35,
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop",
    price: 89.99,
    originalPrice: 159.99,
    rating: 4.7,
    reviewCount: 47
  }
];

// Mock student data
export const students: Student[] = [
  { id: "s1", name: "Alex Johnson", email: "alex@example.com", joinDate: "2023-05-15", courseId: "c1", progress: 75 },
  { id: "s2", name: "Jamie Lee", email: "jamie@example.com", joinDate: "2023-06-02", courseId: "c1", progress: 60 },
  { id: "s3", name: "Taylor Wright", email: "taylor@example.com", joinDate: "2023-05-20", courseId: "c1", progress: 90 },
  { id: "s4", name: "Morgan Chen", email: "morgan@example.com", joinDate: "2023-06-10", courseId: "c1", progress: 40 },
  { id: "s5", name: "Jordan Patel", email: "jordan@example.com", joinDate: "2023-06-15", courseId: "c1", progress: 25 },
  { id: "s6", name: "Casey Davis", email: "casey@example.com", joinDate: "2023-05-12", courseId: "c2", progress: 80 },
  { id: "s7", name: "Riley Wilson", email: "riley@example.com", joinDate: "2023-05-25", courseId: "c2", progress: 65 },
  { id: "s8", name: "Quinn Murphy", email: "quinn@example.com", joinDate: "2023-06-05", courseId: "c2", progress: 50 },
  { id: "s9", name: "Reese Garcia", email: "reese@example.com", joinDate: "2023-06-20", courseId: "c2", progress: 30 },
  { id: "s10", name: "Avery Brown", email: "avery@example.com", joinDate: "2023-06-25", courseId: "c4", progress: 15 },
  { id: "s11", name: "Skyler Kim", email: "skyler@example.com", joinDate: "2023-05-10", courseId: "c4", progress: 95 },
  { id: "s12", name: "Dakota Jones", email: "dakota@example.com", joinDate: "2023-05-30", courseId: "c4", progress: 85 }
];

// Mock metrics data
export const metrics: Metric[] = [
  { label: "Total Courses", value: 4, change: 25, icon: "courses" },
  { label: "Active Students", value: 271, change: 12, icon: "students" },
  { label: "Total Engagement", value: 12.5, change: -5, icon: "engagement" },
  { label: "Completion Rate", value: 68, change: 8, icon: "completion" }
];

// Fetch all courses
export const fetchCourses = (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(courses);
    }, 800);
  });
};

// Fetch a course by ID
export const fetchCourseById = (id: string): Promise<Course | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = courses.find(course => course.id === id);
      resolve(course || null);
    }, 800);
  });
};

// Fetch all students
export const fetchStudents = (): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(students);
    }, 500);
  });
};

// Fetch students by course ID
export const fetchStudentsByCourse = (courseId: string): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(students.filter(student => student.courseId === courseId));
    }, 300);
  });
};

// Fetch metrics
export const fetchMetrics = (): Promise<Metric[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(metrics);
    }, 300);
  });
};
