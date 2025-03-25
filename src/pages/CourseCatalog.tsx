
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Menu, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CatalogCourse, catalogService } from '@/services/catalog.service';
import { toast } from 'sonner';

export default function CourseCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  
  // Fetch all courses for catalog
  const { data: allCourses, isLoading, error } = useQuery({
    queryKey: ['catalogCourses'],
    queryFn: catalogService.getCatalogCourses,
  });
  
  // Filtered courses based on search
  const [filteredCourses, setFilteredCourses] = useState<CatalogCourse[]>([]);
  
  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCourses(allCourses || []);
      return;
    }
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const filtered = allCourses?.filter(course => 
      course.title.toLowerCase().includes(normalizedQuery)
    ) || [];
    
    setFilteredCourses(filtered);
    
    if (filtered.length === 0) {
      toast.info('No courses found matching your search');
    }
  };
  
  // Update filtered courses when all courses load
  useEffect(() => {
    if (allCourses) {
      setFilteredCourses(allCourses);
    }
  }, [allCourses]);
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, you would call your logout API
    toast.success('Logged out successfully');
    // Navigate to login or home page
    navigate('/');
  };
  
  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };
  
  // Course card component
  const CourseCard = ({ course }: { course: CatalogCourse }) => {
    return (
      <Card className="bg-gray-700 p-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl cursor-pointer"
        onClick={() => navigate(`/course/${course.id}`)}>
        <div className="block">
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-32 object-cover rounded-lg mb-4" 
          />
          <div className="text-white">
            <h3 className="text-lg font-semibold line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center mt-2">
              <StarRating rating={course.rating} />
              <span className="text-sm ml-2">({course.reviewCount})</span>
            </div>
            <p className="text-xl mt-2">
              ${course.price.toFixed(2)}
              <span className="line-through text-gray-400 ml-2">${course.originalPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </Card>
    );
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading courses...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-white">Error loading courses</div>;
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Custom Navbar */}
      <nav className="bg-[#1e2a47] p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="h-16 md:h-20 flex items-center text-2xl font-bold">
            CustomAcademy
          </div>

          {/* Search bar */}
          <div className="flex items-center space-x-4 bg-[#29396b] p-2 rounded-full w-1/2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="What do you want to learn"
              className="bg-[#29396b] text-white placeholder-gray-400 focus:outline-none w-full border-none"
            />
            <Button 
              onClick={handleSearch}
              className="bg-[#1e2a47] text-white p-2 rounded-full hover:bg-[#29396b] transition"
            >
              <Search size={18} />
            </Button>
          </div>

          {/* User Profile and Menu */}
          <div className="flex items-center space-x-4 relative">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="text-gray-200">Hello, User!</span>
            </div>

            {/* Menu button */}
            <Button 
              variant="ghost" 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-gray-300 hover:text-white transition"
            >
              <Menu size={18} />
            </Button>

            {/* The dropdown card for logout */}
            {showMenu && (
              <div className="absolute top-14 right-0 bg-gray-700 p-3 rounded-lg shadow-lg z-10">
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
      <div className="container mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-gray-200">
            All the skills you need in one place
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl">
            From critical soft skills to in-demand technical topics,
            CustomAcademy supports your professional development.
          </p>
        </div>

        {/* Courses Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-200 mb-6">
            Let's Start Learning
          </h2>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              No courses found. Try a different search.
            </div>
          )}
        </section>

        {/* Recommended Section */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-200 mb-2">What to Learn Next</h2>
          <p className="text-lg text-gray-400 mb-6">Recommended for you</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCourses.slice(4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1e2a47] p-6 text-gray-400 text-center mt-6">
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
