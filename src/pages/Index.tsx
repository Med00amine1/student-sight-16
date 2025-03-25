import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Menu } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { catalogService, CatalogCourse } from "@/services/catalog.service";

interface Course {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
}

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Fetch featured courses and convert to Course type
        const featured = await catalogService.getFeaturedCourses();
        setFeaturedCourses(featured.slice(0, 4).map(convertToCourse)); // Show only 4 featured courses
        
        // Fetch recommended courses and convert to Course type
        const recommended = await catalogService.getRecommendedCourses();
        setRecommendedCourses(recommended.slice(0, 4).map(convertToCourse)); // Show only 4 recommended courses
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load course data");
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
      originalPrice: catalogCourse.originalPrice || catalogCourse.price, // Default to price if originalPrice is not set
      rating: catalogCourse.rating,
      reviewCount: catalogCourse.reviewCount,
      image: catalogCourse.image || '/placeholder.svg',
      category: catalogCourse.category || 'General'
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1e2a47] p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">CA</span>
            </div>
            <span>CustomAcademy</span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-4 bg-[#29396b] p-2 rounded-full w-1/2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn"
              className="bg-[#29396b] text-white placeholder-gray-400 focus:outline-none border-none focus-visible:ring-0 w-full"
            />
            <Button type="submit" variant="ghost" className="bg-[#1e2a47] text-white p-2 rounded-full hover:bg-[#29396b] transition h-auto">
              <Search size={18} />
            </Button>
          </form>

          {/* User Profile and Menu */}
          <div className="flex items-center space-x-4 relative">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-gray-200">Hello, {user?.name || "User"}!</span>
            </div>

            {/* Menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-300 hover:text-white transition"
            >
              <Menu size={20} />
            </Button>

            {/* The dropdown menu */}
            {showMenu && (
              <div className="absolute top-14 right-0 bg-gray-700 p-3 rounded-lg shadow-lg z-50 w-48">
                {user?.isTeacher && (
                  <Button
                    variant="ghost"
                    onClick={goToDashboard}
                    className="w-full text-left py-2 px-3 hover:bg-gray-600 transition mb-2"
                  >
                    Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-3 hover:bg-gray-600 transition"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="container mx-auto px-6 py-12 flex-1">
        {/* Introduction */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-gray-200">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl">
            Continue learning or explore new courses to boost your skills.
          </p>
          
          {user?.isTeacher && (
            <Button 
              onClick={goToDashboard}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Go to Instructor Dashboard
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Featured Courses Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-semibold text-gray-200 mb-6 flex justify-between items-center">
                <span>Featured Courses</span>
                <Link to="/catalog" className="text-blue-500 hover:text-blue-400 text-base">
                  View All Courses →
                </Link>
              </h2>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredCourses.length > 0 ? (
                  featuredCourses.map((course) => (
                    <div key={course.id} className="bg-gray-700 p-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl">
                      <Link to={`/course/${course.id}`} className="block">
                        <div className="w-full h-32 bg-gray-600 rounded-lg mb-4 overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="text-lg font-semibold truncate">
                            {course.title}
                          </h3>
                          <div className="flex items-center mt-2">
                            <span className="text-yellow-400">{'★'.repeat(Math.round(course.rating))}</span>
                            <span className="text-sm ml-2">({course.reviewCount})</span>
                          </div>
                          <p className="text-xl mt-2">
                            ${course.price.toFixed(2)}
                            {course.originalPrice > course.price && (
                              <span className="line-through text-gray-400 ml-2">${course.originalPrice.toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10">
                    <p className="text-gray-400">No featured courses available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Recommended Courses Section */}
            <section>
              <h2 className="text-3xl font-semibold text-gray-200 mb-2">What to Learn Next</h2>
              <p className="text-lg text-gray-400 mb-6">Recommended for you</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map((course) => (
                    <div key={course.id} className="bg-gray-700 p-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl">
                      <Link to={`/course/${course.id}`} className="block">
                        <div className="w-full h-32 bg-gray-600 rounded-lg mb-4 overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="text-lg font-semibold truncate">
                            {course.title}
                          </h3>
                          <div className="flex items-center mt-2">
                            <span className="text-yellow-400">{'★'.repeat(Math.round(course.rating))}</span>
                            <span className="text-sm ml-2">({course.reviewCount})</span>
                          </div>
                          <p className="text-xl mt-2">
                            ${course.price.toFixed(2)}
                            {course.originalPrice > course.price && (
                              <span className="line-through text-gray-400 ml-2">${course.originalPrice.toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10">
                    <p className="text-gray-400">No recommended courses available</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1e2a47] p-6 text-gray-400 text-center mt-auto">
        <p>
          &copy; 2025 CustomAcademy, Inc.
          <span className="block text-sm mt-1">
            All prices in US dollars. Terms and conditions apply.
          </span>
        </p>
      </footer>
    </div>
  );
}
