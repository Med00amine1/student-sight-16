
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to their index page
    if (authService.isLoggedIn()) {
      navigate('/index');
    }
  }, [navigate]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For non-logged in users, we'll just navigate to login with search query in params
      navigate(`/login?redirect=/catalog&search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-4 px-8 bg-gray-800">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">CA</span>
          </div>
          <div className="text-2xl font-bold text-white">CustomAcademy</div>
        </div>

        {/* Search Bar Section */}
        <form onSubmit={handleSearch} className="flex items-center bg-gray-700 px-6 py-3 rounded-full w-1/2 mx-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to learn"
            className="bg-transparent text-white border-none focus-visible:ring-0 outline-none w-full"
          />
          <Button type="submit" variant="ghost" className="bg-[#1e2a47] text-white p-2 rounded-full hover:bg-[#29396b]">
            <Search className="h-5 w-5" />
          </Button>
        </form>
        
        {/* Empty div to balance layout */}
        <div className="w-1/5"></div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6 bg-gray-900">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-20"></div>

        <div className="text-left pl-6 relative">
          <h2 className="text-5xl font-bold text-white leading-tight mb-2">Achieve your career goals</h2>
          <h2 className="text-5xl font-bold text-white leading-tight">with CustomAcademy</h2>

          <div className="mt-8 flex space-x-6">
            <Link
              to="/login"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transform transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transform transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Sign Up
            </Link>
          </div>

          {/* Person's Image - Using a placeholder */}
          <div className="absolute bottom-0 right-8 mb-8">
            <div className="w-96 h-96 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="px-8 py-6 bg-gray-800">
        <h2 className="text-2xl font-semibold">All the skills you need in one place</h2>
        <div className="flex space-x-6 mt-4 text-blue-400 overflow-x-auto pb-2">
          <a href="#" className="whitespace-nowrap">Data Science</a>
          <a href="#" className="whitespace-nowrap">IT Certifications</a>
          <a href="#" className="whitespace-nowrap">Leadership</a>
          <a href="#" className="whitespace-nowrap">Web Development</a>
          <a href="#" className="whitespace-nowrap">Communication</a>
          <a href="#" className="whitespace-nowrap">Business Analytics</a>
        </div>

        {/* Recommended for you */}
        <div className="mb-8 mt-6">
          <h2 className="text-3xl text-white font-semibold mb-4">Featured courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Sample course cards - in a real app these would be fetched from API */}
            {[1, 2, 3, 4].map((id) => (
              <div 
                key={id} 
                className="bg-gray-700 p-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl"
              >
                <div className="block">
                  <div className="w-full h-32 bg-gray-600 rounded-lg mb-4"></div>
                  <div className="text-white">
                    <h3 className="text-lg font-semibold truncate">Sample Course {id}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-400">★★★★☆</span>
                      <span className="text-sm ml-2">(123)</span>
                    </div>
                    <p className="text-xl mt-2">
                      $9.99 <span className="line-through text-gray-400">$19.99</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular categories section */}
        <div className="mb-8">
          <h2 className="text-3xl text-white font-semibold mb-4">
            Popular categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Sample category cards */}
            {['Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing'].map((category) => (
              <div 
                key={category} 
                className="bg-gray-700 p-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl"
              >
                <div className="block">
                  <div className="w-full h-32 bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold">{category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 py-12 px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
          {/* Footer sections */}
          <div>
            <h3 className="text-white font-semibold">Popular Topics</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="hover:text-blue-400">JavaScript</a></li>
              <li><a href="#" className="hover:text-blue-400">React.js</a></li>
              <li><a href="#" className="hover:text-blue-400">Python</a></li>
              <li><a href="#" className="hover:text-blue-400">Data Science</a></li>
              <li><a href="#" className="hover:text-blue-400">Machine Learning</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold">For Teachers</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="hover:text-blue-400">Become an Instructor</a></li>
              <li><a href="#" className="hover:text-blue-400">Teacher Guidelines</a></li>
              <li><a href="#" className="hover:text-blue-400">Earnings</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold">About Us</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="hover:text-blue-400">About CustomAcademy</a></li>
              <li><a href="#" className="hover:text-blue-400">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Links */}
        <div className="text-center text-gray-400 mt-12">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">CA</span>
            </div>
            <p>&copy; 2025 CustomAcademy, Inc.</p>
          </div>

          <div className="flex justify-center mt-4 space-x-8">
            <a href="#" className="hover:text-blue-400">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-400">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
