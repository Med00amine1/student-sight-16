
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, BookOpen, Award, Users } from "lucide-react";
import { courseService } from "@/services/courses.service";
import { catalogService } from "@/services/catalog.service";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

interface CourseSection {
  title: string;
  lectures: {
    title: string;
    duration: number;
  }[];
}

interface CourseDetailsData {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  instructor: {
    name: string;
    bio?: string;
  };
  rating: number;
  reviewCount: number;
  studentCount: number;
  totalHours: number;
  totalLectures: number;
  lastUpdated: string;
  sections: CourseSection[];
  image: string;
  category: string;
  level: string;
  isEnrolled?: boolean;
}

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<number[]>([0, 1]); // First two sections open by default

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // For a full implementation, you would combine data from catalogService and courseService
        const catalogCourse = await catalogService.getCourseById(id);
        
        if (!catalogCourse) {
          toast.error("Course not found");
          return;
        }

        // Create mock sections for now - in a real app, this would come from the API
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
              { title: "Install Tailwind CSS", duration: 10 },
              { title: "Configure Tailwind with React", duration: 15 },
              { title: "Creating Custom Components", duration: 20 },
              { title: "Responsive Design with Tailwind", duration: 25 }
            ]
          },
          {
            title: "Frontend Project",
            lectures: [
              { title: "Creating Pages and Routes", duration: 15 },
              { title: "Building UI Components", duration: 20 },
              { title: "State Management", duration: 25 },
              { title: "API Integration", duration: 20 }
            ]
          },
          {
            title: "Backend Project",
            lectures: [
              { title: "Setting up Express Server", duration: 15 },
              { title: "Creating API Routes", duration: 20 },
              { title: "Database Integration", duration: 25 },
              { title: "Authentication Implementation", duration: 25 }
            ]
          }
        ];
        
        // Calculate total hours and lectures
        let totalHours = 0;
        let totalLectures = 0;
        mockSections.forEach(section => {
          section.lectures.forEach(lecture => {
            totalHours += lecture.duration / 60; // Convert minutes to hours
            totalLectures++;
          });
        });
        
        // Combine data
        const courseDetails: CourseDetailsData = {
          id: catalogCourse.id,
          title: catalogCourse.title,
          description: catalogCourse.description || "Master MERN Stack by building a Full Stack AI Text to Image SaaS App using React.js, MongoDB, Node.js, Express & Stripe Payment",
          price: catalogCourse.price,
          originalPrice: catalogCourse.originalPrice || catalogCourse.price * 2,
          instructor: {
            name: catalogCourse.instructor?.name || "Richard James",
            bio: catalogCourse.instructor?.bio || "Experienced full-stack developer with 10+ years of experience"
          },
          rating: catalogCourse.rating,
          reviewCount: catalogCourse.reviewCount,
          studentCount: catalogCourse.enrolled || 31,
          totalHours: totalHours,
          totalLectures: totalLectures,
          lastUpdated: catalogCourse.updatedAt || "2023-09-15",
          sections: mockSections,
          image: catalogCourse.image || "/placeholder.svg",
          category: catalogCourse.category || "Web Development",
          level: catalogCourse.level || "Intermediate",
          isEnrolled: false // This would be determined by checking the user's enrolled courses
        };
        
        setCourseData(courseDetails);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [id]);
  
  const toggleSection = (index: number) => {
    if (openSections.includes(index)) {
      setOpenSections(openSections.filter(i => i !== index));
    } else {
      setOpenSections([...openSections, index]);
    }
  };
  
  const handleEnroll = async () => {
    if (!id || !courseData) return;
    
    if (!authService.isLoggedIn()) {
      toast.info("Please login to enroll in this course");
      return;
    }
    
    try {
      // This would be replaced with an actual API call in a full implementation
      toast.success(`Successfully enrolled in ${courseData.title}`);
      // Navigate to course player
      window.location.href = `/course-player/${id}`;
    } catch (error) {
      console.error("Failed to enroll:", error);
      toast.error("Failed to enroll in course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <Link 
            to="/index" 
            className="flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to courses
          </Link>
          
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
            <p className="text-gray-400 mb-8">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/index">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <Link 
          to="/index" 
          className="flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to courses
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="w-full lg:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
            <p className="text-gray-400 mb-3">{courseData.description}</p>
            
            <div className="flex items-center mb-4">
              <span className="text-yellow-400 flex">
                {'★'.repeat(Math.round(courseData.rating))}
                {'☆'.repeat(5 - Math.round(courseData.rating))}
              </span>
              <span className="text-gray-400 ml-2">({courseData.reviewCount} ratings)</span>
              <span className="text-gray-400 ml-4">{courseData.studentCount} students</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Created by <span className="text-blue-400">{courseData.instructor.name}</span>
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{courseData.totalHours.toFixed(1)} hours</span>
              </div>
              <div className="flex items-center">
                <BookOpen size={16} className="mr-1" />
                <span>{courseData.totalLectures} lectures</span>
              </div>
              <div className="flex items-center">
                <Award size={16} className="mr-1" />
                <span>{courseData.level}</span>
              </div>
              <div className="flex items-center">
                <span>Last updated: {courseData.lastUpdated}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Course Content</h3>
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span>{courseData.sections.length} sections • {courseData.totalLectures} lectures • {courseData.totalHours.toFixed(1)} total hours</span>
                </div>
                
                {courseData.sections.map((section, index) => (
                  <div key={section.title} className="mb-2 border-b border-gray-700 pb-2 last:border-b-0">
                    <div 
                      className="flex justify-between items-center cursor-pointer py-2"
                      onClick={() => toggleSection(index)}
                    >
                      <div className="font-semibold">
                        <span>Section {index + 1}: {section.title}</span>
                      </div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <span className="mr-2">{section.lectures.length} lectures</span>
                        <span>{section.lectures.reduce((acc, l) => acc + l.duration, 0)} min</span>
                        <span className="ml-2">{openSections.includes(index) ? '▼' : '►'}</span>
                      </div>
                    </div>
                    
                    {openSections.includes(index) && (
                      <div className="ml-4 mt-2 space-y-2">
                        {section.lectures.map((lecture, lIndex) => (
                          <div 
                            key={lecture.title}
                            className="flex justify-between items-center text-sm py-1"
                          >
                            <div className="flex items-center">
                              <BookOpen size={14} className="mr-2 text-gray-400" />
                              <span>{lecture.title}</span>
                            </div>
                            <span className="text-gray-400">{lecture.duration} min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-800 border-gray-700 sticky top-8">
              <div className="relative">
                <img 
                  src={courseData.image} 
                  alt={courseData.title} 
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                  {courseData.category}
                </span>
              </div>
              
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl font-bold">${courseData.price.toFixed(2)}</span>
                  {courseData.originalPrice > courseData.price && (
                    <>
                      <span className="text-gray-400 line-through text-lg">${courseData.originalPrice.toFixed(2)}</span>
                      <span className="text-green-500 text-sm">
                        {Math.round((1 - courseData.price / courseData.originalPrice) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
                
                <p className="text-red-400 text-sm mb-4">
                  <span className="font-semibold">⏰ 5 days left at this price!</span>
                </p>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4" 
                  size="lg"
                  onClick={handleEnroll}
                >
                  {courseData.isEnrolled ? 'Go to Course' : 'Enroll Now'}
                </Button>
                
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Full lifetime access
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Access on mobile and desktop
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Certificate of completion
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    30-day money-back guarantee
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
