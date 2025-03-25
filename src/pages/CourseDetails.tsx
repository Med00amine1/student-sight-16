import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { catalogService } from "@/services/catalog.service";
import { courseService } from "@/services/courses.service";
import { authService } from "@/services/auth.service";

type CourseSection = {
  title: string;
  lectures: {
    title: string;
    duration: number;
  }[];
};

type Instructor = {
  name: string;
  bio: string;
  avatar?: string;
};

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const mockSections: CourseSection[] = [
    {
      title: "Project Introduction",
      lectures: [
        { title: "App Overview – Build Text-to-Image SaaS", duration: 10 },
        { title: "Tech Stack – React, Node.js, MongoDB", duration: 15 },
        { title: "Core Features – Authentication, Payment, Deployment", duration: 20 }
      ]
    },
    {
      title: "Project Setup and Configuration",
      lectures: [
        { title: "Environment Setup – Install Node.js, VS Code", duration: 10 },
        { title: "Repository Setup – Clone project repository", duration: 10 },
        { title: "Install Dependencies – Set up npm packages", duration: 10 },
        { title: "Initial Configuration – Set up basic files and folders", duration: 15 }
      ]
    },
    {
      title: "Tailwind Setup",
      lectures: [
        { title: "Installing Tailwind CSS", duration: 12 },
        { title: "Configuring Tailwind", duration: 15 },
        { title: "Creating Basic UI Components", duration: 18 }
      ]
    },
    {
      title: "Frontend Project",
      lectures: [
        { title: "Setting up React Router", duration: 15 },
        { title: "Creating Main Pages", duration: 20 },
        { title: "Implementing Authentication UI", duration: 25 }
      ]
    },
    {
      title: "Backend Project",
      lectures: [
        { title: "Setting up Express Server", duration: 15 },
        { title: "Creating API Routes", duration: 20 },
        { title: "Database Integration", duration: 25 }
      ]
    }
  ];

  const mockInstructor: Instructor = {
    name: "Richard James",
    bio: "Senior Developer with 10+ years of experience in full-stack development. Specialized in React and Node.js applications.",
    avatar: "/placeholder.svg"
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    const fetchCourse = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const courseData = await catalogService.getCourseById(id);
        
        if (courseData) {
          setCourse(courseData);
        } else {
          const fallbackCourse = await courseService.getCourseById(id);
          if (fallbackCourse) {
            setCourse({
              ...fallbackCourse,
              price: 49.99,
              originalPrice: 99.99,
              rating: 4.5,
              reviewCount: 120
            });
          }
        }
        
        setSections(mockSections); // Using mock sections for demonstration
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    fetchCourse();
  }, [id]);
  
  const handleEnrollCourse = async () => {
    if (!course || !id) return;
    
    if (!isAuthenticated) {
      toast.error("Please login to enroll in this course");
      navigate("/login", { state: { from: `/course-details/${id}` } });
      return;
    }
    
    navigate(`/payment/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <p className="mt-2">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/catalog")} className="mt-4">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar is included in Layout component */}
      
      {/* Main Content */}
      <div className="container mx-auto py-10 px-5 flex flex-col lg:flex-row items-start gap-10">
        {/* Course Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-400 mt-2">{course.description}</p>
          <div className="mt-2 flex items-center">
            <span className="text-yellow-400">{"★".repeat(Math.round(course.rating))}</span>
            <span className="text-gray-400 ml-2">({course.reviewCount} ratings)</span>
            <span className="text-gray-400 ml-4">{course.enrolledCount || course.enrolled || 0} students</span>
          </div>
          <p className="text-gray-400 mt-2">Course by <span className="text-blue-400">{mockInstructor.name}</span></p>
          <p className="text-gray-400 text-sm">{mockInstructor.bio}</p>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold">What you'll learn</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span> 
                Build a complete SaaS application from scratch
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span> 
                Implement user authentication and authorization
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span> 
                Create secure payment processing with Stripe
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span> 
                Deploy your application to production
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span> 
                Master React and Node.js best practices
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span> 
                Understand MongoDB and database design
              </li>
            </ul>
          </div>
          
          <h3 className="text-lg font-semibold mt-8">Course Structure</h3>
          <div className="bg-gray-800 p-4 rounded-lg mt-2">
            {sections.map((section, index) => (
              <details key={index} className="mb-2 border-b border-gray-700 pb-2 last:border-0">
                <summary className="cursor-pointer font-semibold">
                  📌 {section.title} ({section.lectures.length} lectures - {section.lectures.reduce((acc, lecture) => acc + lecture.duration, 0)}m)
                </summary>
                <ul className="ml-4 mt-2 text-gray-400">
                  {section.lectures.map((lecture, idx) => (
                    <li key={idx} className="mb-1">
                      ✔ {lecture.title} ({lecture.duration}m)
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
        
        {/* Course Card */}
        <div className="w-full lg:w-80">
          <Card className="bg-gray-800 overflow-hidden">
            {/* Image */}
            <div className="relative">
              <img 
                src={course.image || "/placeholder.svg"} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
              <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                🔥 BEST SELLER
              </span>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h2 className="text-md font-bold text-white leading-tight">{course.title}</h2>
              
              {/* Discount Offer */}
              <p className="text-red-500 text-xs mt-1 flex items-center">
                ⏳ <span className="ml-1 font-semibold">5 days left at this price!</span>
              </p>
              
              {/* Pricing */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg font-bold text-white">${course.price.toFixed(2)}</span>
                {course.originalPrice > course.price && (
                  <>
                    <span className="text-gray-500 line-through text-sm">${course.originalPrice.toFixed(2)}</span>
                    <span className="text-green-600 text-xs font-semibold">
                      {Math.round(100 - (course.price / course.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              
              {/* Rating, Hours, Lessons */}
              <div className="flex items-center space-x-2 text-gray-400 text-xs mt-1">
                <span>⭐ {course.rating.toFixed(1)}</span>
                <span>📚 30h</span>
                <span>📖 {sections.reduce((total, section) => total + section.lectures.length, 0)} lessons</span>
              </div>
              
              {/* Enroll Button */}
              <Button
                onClick={handleEnrollCourse}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
              >
                Enroll Now
              </Button>
              
              {/* Course Features */}
              <div className="mt-3 text-gray-300 text-xs space-y-1">
                <p>✅ Lifetime access & free updates.</p>
                <p>✅ Hands-on project guidance.</p>
                <p>✅ Downloadable resources.</p>
                <p>✅ Quizzes & certification.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Footer is included in Layout component */}
    </div>
  );
}
