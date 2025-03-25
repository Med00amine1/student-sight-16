import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from query parameters or location state
  const from = location.state?.from?.pathname || '/index';
  
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Client-side validation
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    
    if (password.length === 0) {
      setErrorMsg('Please enter a password.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.login({ email, password });
      toast.success('Login successful!');
      navigate(from);
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    toast.info('Google login is not implemented yet');
  };
  
  const handleFacebookLogin = () => {
    toast.info('Facebook login is not implemented yet');
  };
  
  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-3 bg-gray-800">
        <div className="flex items-center">
          <img src="/placeholder.svg" alt="Logo" width="100" />
          <Link to="/" className="text-white ml-2">CustomAcademy</Link>
        </div>
      </nav>

      {/* Main login page layout */}
      <div className="flex justify-center items-center flex-grow">
        <div className="flex w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Image of students on the left */}
          <div className="w-1/2 pr-4 hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Students Learning"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Login Form Section on the right */}
          <div className="w-full md:w-1/2 pl-4">
            <h1 className="text-center mb-4 text-white-400">
              Login to continue your learning journey
            </h1>

            {errorMsg && (
              <div className="mb-4 p-2 bg-red-900/30 border border-red-500 rounded text-center text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 mt-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter your email"
                  required
                  maxLength={30}
                />
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mt-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter your password"
                  required
                  maxLength={8}
                />
              </div>

              {/* Continue with Email Button */}
              <div className="flex justify-center mb-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transform hover:scale-105 transition"
                >
                  {isLoading ? 'Logging in...' : 'Continue with Email'}
                </Button>
              </div>

              {/* Other Login Options */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400">Or login with</p>
              </div>

              {/* Social Media Buttons */}
              <div className="flex justify-center space-x-4 mb-4">
                {/* Google */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-1/2 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none transform hover:scale-105 transition"
                >
                  <img
                    src="/placeholder.svg"
                    alt="Google"
                    className="w-6 h-6 inline mr-2"
                  />
                  Google
                </Button>

                {/* Facebook */}
                <Button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="w-1/2 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none transform hover:scale-105 transition"
                >
                  <img
                    src="/placeholder.svg"
                    alt="Facebook"
                    className="w-6 h-6 inline mr-2"
                  />
                  Facebook
                </Button>
              </div>

              {/* Sign Up Link */}
              <p className="text-center mt-4 text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 hover:text-blue-400">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-auto">
        <div className="container mx-auto flex justify-between">
          {/* Left */}
          <div className="flex items-center">
            <img
              src="/placeholder.svg"
              alt="Logo"
              className="w-12 h-auto mr-2"
            />
            <p>© 2025 CustomAcademy, Inc.</p>
          </div>

          {/* Right */}
          <div className="flex items-center">
            <div className="px-4">
              <Link to="/privacy-policy" className="hover:text-white">About Us</Link>
            </div>
            <div className="px-4">
              <Link to="#" className="hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
