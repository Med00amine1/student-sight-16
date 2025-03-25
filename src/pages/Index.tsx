
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Menu } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    // In a real app, you would call the Flask logout endpoint
    toast.success("Logged out successfully");
    // This would normally redirect to login page
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1e2a47] p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold">CustomAcademy</div>

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
              <span className="text-gray-200">Hello, User!</span>
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

            {/* The dropdown card for logout */}
            {showMenu && (
              <div className="absolute top-14 right-0 bg-gray-700 p-3 rounded-lg shadow-lg z-50">
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
            All the skills you need in one place
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl">
            From critical soft skills to in-demand technical topics,
            CustomAcademy supports your professional development.
          </p>
        </div>

        {/* Main call to action */}
        <div className="mb-16 text-center">
          <Link to="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg">
              Go to Dashboard
            </Button>
          </Link>
          <p className="mt-4 text-gray-400">
            Access your instructor dashboard to manage courses, students, and more
          </p>
        </div>

        {/* Featured Courses Section Preview */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-200 mb-6 flex justify-between items-center">
            <span>Featured Courses</span>
            <Link to="/catalog" className="text-blue-500 hover:text-blue-400 text-base">
              View All Courses →
            </Link>
          </h2>

          {/* Courses Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Course cards would be generated from API data */}
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="bg-gray-700 p-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl">
                <Link to={`/catalog`} className="block">
                  <div className="w-full h-32 bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-sm text-gray-400">Course Image</span>
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-semibold truncate">
                      Sample Course Title {id}
                    </h3>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-400">★★★★☆</span>
                      <span className="text-sm ml-2">(123)</span>
                    </div>
                    <p className="text-xl mt-2">
                      $9.99
                      <span className="line-through text-gray-400 ml-2">$19.99</span>
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
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
};

export default Index;
