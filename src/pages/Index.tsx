
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Menu, BookOpen, GraduationCap, Clock, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { catalogService, CatalogCourse } from "@/services/catalog.service";
import { courseService } from "@/services/courses.service";

interface Course {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  instructor?: string;
  totalLectures?: number;
  totalDuration?: string;
  lastUpdated?: string;
}

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Fetch featured courses and convert to Course type
        const featured = await catalogService.getFeaturedCourses();
        setFeaturedCourses(featured.slice(0, 4).map(convertToCourse)); 
        
        // Fetch recommended courses and convert to Course type
        const recommended = await catalogService.getRecommendedCourses();
        setRecommendedCourses(recommended.slice(0, 4).map(convertToCourse));
        
        // Fetch enrolled courses
        const purchased = await courseService.getPurchasedCourses();
        setEnrolledCourses(purchased.map(convertServiceCourse));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper function to convert CatalogCourse to Course
  const convertToCourse = (catalogCourse: CatalogCourse): Course => {
    return {
      id: catalogCourse.id,
      title: catalogCourse.title,
      price: catalogCourse.price,
      originalPrice: catalogCourse.originalPrice || catalogCourse.price,
      rating: catalogCourse.rating,
      reviewCount: catalogCourse.reviewCount,
      image: catalogCourse.image || '/placeholder.svg',
      category: catalogCourse.category || 'General',
      instructor: catalogCourse.instructor,
      totalLectures: Math.floor(Math.random() * 40) + 10, // Random number for demo
      totalDuration: `${Math.floor(Math.random() * 15) + 2}h ${Math.floor(Math.random() * 50) + 10}m`, // Random duration
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString()
    };
  };
  
  // Helper function to convert service Course to display Course
  const convertServiceCourse = (serviceCourse: any): Course => {
    return {
      id: serviceCourse.id,
      title: serviceCourse.title,
      price: serviceCourse.price || 49.99,
      originalPrice: serviceCourse.originalPrice || 69.99,
      rating: serviceCourse.rating || 4.5,
      reviewCount: serviceCourse.reviewCount || 120,
      image: serviceCourse.cover || '/placeholder.svg',
      category: serviceCourse.category || 'Development',
      totalLectures: serviceCourse.lectures || Math.floor(Math.random() * 40) + 10,
      totalDuration: serviceCourse.duration || `${Math.floor(Math.random() * 15) + 2}h ${Math.floor(Math.random() * 50) + 10}m`,
      lastUpdated: serviceCourse.updatedAt || new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString()
    };
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  const goToDashboard = () => {
    authService.switchToTeacherMode();
    navigate("/dashboard");
  };
  
  const calculateProgress = (courseId: string) => {
    // This would normally come from the backend
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 p-4 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">CA</span>
            </div>
            <span className="text-purple-700">CustomAcademy</span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-4 bg-slate-100 p-2 rounded-full w-1/2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn?"
              className="bg-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none border-none focus-visible:ring-0 w-full"
            />
            <Button type="submit" variant="ghost" className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition h-auto">
              <Search size={18} />
            </Button>
          </form>

          {/* User Profile and Menu */}
          <div className="flex items-center space-x-4 relative">
            {user?.isTeacher && (
              <Button
                onClick={goToDashboard}
                variant="outline"
                className="hidden md:flex items-center gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <GraduationCap size={18} />
                <span>Teacher Dashboard</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-2 border-l pl-4 border-slate-200">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <User size={18} className="text-purple-600" />
              </div>
              <span className="text-slate-700 font-medium hidden md:inline-block">Hello, {user?.name || "User"}!</span>
            </div>

            {/* Menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Menu size={20} />
            </Button>

            {/* The dropdown menu */}
            {showMenu && (
              <div className="absolute top-14 right-0 bg-white p-3 rounded-lg shadow-lg z-50 w-48 border border-slate-200">
                <div className="border-b border-slate-200 pb-2 mb-2">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                
                {user?.isTeacher && (
                  <Button
                    variant="ghost"
                    onClick={goToDashboard}
                    className="w-full text-left justify-start py-2 px-3 hover:bg-slate-100 transition mb-2"
                  >
                    <GraduationCap size={16} className="mr-2" />
                    <span>Teacher Dashboard</span>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full text-left justify-start py-2 px-3 hover:bg-slate-100 transition"
                >
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="container mx-auto px-6 py-8 flex-1">
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <div className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 text-white hover:bg-white/20" 
              onClick={() => setShowWelcomeBanner(false)}
            >
              ✕
            </Button>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Learner"}!</h1>
            <p className="text-lg opacity-90 max-w-2xl mb-4">
              Ready to continue your learning journey? Discover new courses or pick up where you left off.
            </p>
            <Button className="bg-white text-purple-700 hover:bg-purple-50" onClick={() => navigate('/catalog')}>
              Explore Courses
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* My Learning Section - If user has enrolled courses */}
            {enrolledCourses.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                  <span>My Learning</span>
                  <Link to="/course-player/any-id" className="text-purple-600 hover:text-purple-700 text-base font-medium">
                    See all my courses →
                  </Link>
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition">
                      <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-semibold text-xl mb-2">{course.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">Instructor: {course.instructor || "John Doe"}</p>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-slate-100 h-2 rounded-full flex-grow">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{width: `${calculateProgress(course.id)}%`}}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{calculateProgress(course.id)}%</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{course.totalDuration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen size={14} />
                              <span>{course.totalLectures} lectures</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                            onClick={() => navigate(`/course-player/${course.id}`)}
                          >
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Learning Statistics */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Learning Stats</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-4 bg-white border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Courses</p>
                      <h3 className="text-2xl font-bold">{enrolledCourses.length}</h3>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Clock size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Hours Spent</p>
                      <h3 className="text-2xl font-bold">{Math.floor(Math.random() * 50) + 5}</h3>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <BarChart2 size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Quizzes Passed</p>
                      <h3 className="text-2xl font-bold">{Math.floor(Math.random() * 15) + 2}</h3>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <GraduationCap size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Certificates</p>
                      <h3 className="text-2xl font-bold">{Math.floor(Math.random() * 3)}</h3>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Featured Courses Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex justify-between items-center">
                <span>Featured Courses</span>
                <Link to="/catalog" className="text-purple-600 hover:text-purple-700 text-base font-medium">
                  View All Courses →
                </Link>
              </h2>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredCourses.length > 0 ? (
                  featuredCourses.map((course) => (
                    <div key={course.id} className="bg-white border border-slate-200 rounded-lg transition transform hover:shadow-lg">
                      <Link to={`/course-details/${course.id}`} className="block">
                        <div className="w-full h-40 rounded-t-lg overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm text-slate-500">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="text-xs font-medium text-purple-600 mb-1">{course.category}</div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 mb-2">By {course.instructor || "John Doe"}</p>
                          <div className="flex items-center mt-1 mb-2">
                            <span className="text-amber-500 font-bold">{course.rating.toFixed(1)}</span>
                            <span className="text-amber-400 ml-1">{"★".repeat(Math.round(course.rating))}</span>
                            <span className="text-xs ml-1 text-slate-500">({course.reviewCount})</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-700 gap-2">
                            <span>{course.totalLectures} lectures</span>
                            <span>•</span>
                            <span>{course.totalDuration}</span>
                          </div>
                          <p className="text-lg font-bold text-slate-900 mt-2">
                            ${course.price.toFixed(2)}
                            {course.originalPrice > course.price && (
                              <span className="line-through text-slate-500 text-sm ml-2">${course.originalPrice.toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10">
                    <p className="text-slate-500">No featured courses available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Recommended Courses Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">What to Learn Next</h2>
              <p className="text-slate-500 mb-6">Recommended based on your interests</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map((course) => (
                    <div key={course.id} className="bg-white border border-slate-200 rounded-lg transition transform hover:shadow-lg">
                      <Link to={`/course-details/${course.id}`} className="block">
                        <div className="w-full h-40 rounded-t-lg overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm text-slate-500">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="text-xs font-medium text-purple-600 mb-1">{course.category}</div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 mb-2">By {course.instructor || "John Doe"}</p>
                          <div className="flex items-center mt-1 mb-2">
                            <span className="text-amber-500 font-bold">{course.rating.toFixed(1)}</span>
                            <span className="text-amber-400 ml-1">{"★".repeat(Math.round(course.rating))}</span>
                            <span className="text-xs ml-1 text-slate-500">({course.reviewCount})</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-700 gap-2">
                            <span>{course.totalLectures} lectures</span>
                            <span>•</span>
                            <span>{course.totalDuration}</span>
                          </div>
                          <p className="text-lg font-bold text-slate-900 mt-2">
                            ${course.price.toFixed(2)}
                            {course.originalPrice > course.price && (
                              <span className="line-through text-slate-500 text-sm ml-2">${course.originalPrice.toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10">
                    <p className="text-slate-500">No recommended courses available</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 p-6 text-slate-600 text-center mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="text-xl font-bold flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-sm">CA</span>
              </div>
              <span className="text-purple-700">CustomAcademy</span>
            </div>
            
            <div className="flex gap-6">
              <Link to="/" className="text-slate-600 hover:text-purple-700">Home</Link>
              <Link to="/catalog" className="text-slate-600 hover:text-purple-700">Courses</Link>
              <Link to="/privacy-policy" className="text-slate-600 hover:text-purple-700">Privacy</Link>
              <Link to="/login" className="text-slate-600 hover:text-purple-700">Sign In</Link>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4 mt-4">
            <p>
              &copy; {new Date().getFullYear()} CustomAcademy, Inc.
              <span className="block text-sm mt-1">
                All prices in US dollars. Terms and conditions apply.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
