
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Client-side validation
    if (name.length === 0 || name.length > 24) {
      setErrorMsg('Full Name must be between 1 and 24 characters.');
      return;
    }
    
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    
    if (email.length > 34) {
      setErrorMsg('Email must not exceed 34 characters.');
      return;
    }
    
    if (password.length === 0 || password.length > 8) {
      setErrorMsg('Password must be 1-8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.register({ name, email, password });
      toast.success('Registration successful!');
      navigate('/index');
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorMsg(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-3 bg-gray-800">
        <div className="flex items-center">
          <img
            src="/placeholder.svg"
            alt="Logo"
            width="150"
            className="mr-2"
          />
          <Link to="/" className="text-white ml-2">CustomAcademy</Link>
        </div>
      </nav>

      {/* Sign Up Form */}
      <div className="flex justify-center items-center flex-grow px-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full transition-transform duration-300 transform hover:shadow-2xl hover:scale-[1.02]">
          <h2 className="text-3xl font-semibold mb-4 text-center tracking-wide">Sign Up</h2>
          <p className="text-center mb-4 text-gray-400">Create a free account with your email</p>

          {errorMsg && (
            <div className="mb-4 p-2 bg-red-900/30 border border-red-500 rounded text-center text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-300">Full Name</label>
              <Input
                id="full-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                maxLength={24}
                required
                className="w-full p-3 mt-1 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                maxLength={34}
                required
                className="w-full p-3 mt-1 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                maxLength={8}
                required
                className="w-full p-3 mt-1 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                maxLength={8}
                required
                className="w-full p-3 mt-1 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
              />
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 transition transform hover:scale-105"
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </div>
          </form>

          <p className="text-center mt-4 text-sm text-gray-400">
            Have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400">Log In</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-auto">
        <div className="container mx-auto flex justify-between px-4">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="w-12 h-auto mr-2" />
            <p>© 2025 CustomAcademy, Inc.</p>
          </div>
          <div className="flex items-center">
            <div className="px-4">
              <Link to="/privacy-policy" className="hover:text-white">About us</Link>
            </div>
            <div className="px-4">
              <Link to="#" className="hover:text-white">Contact us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;
