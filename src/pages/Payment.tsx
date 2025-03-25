
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { catalogService } from "@/services/catalog.service";
import { courseService } from "@/services/courses.service";

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const courseData = await catalogService.getCourseById(id);
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
        navigate("/catalog");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, navigate]);
  
  // Format card number as xxxx xxxx xxxx xxxx
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, ''); // remove non-digits
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Luhn check for card number validity
  const isValidCardNumber = (numStr: string) => {
    const digits = numStr.replace(/\s+/g, '');
    if (digits.length !== 16) return false;
    
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
  };

  // Check for valid expiry in MM/YY and a plausible range
  const isValidExpiry = (exp: string) => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    const [mm, yy] = exp.split('/');
    const month = parseInt(mm, 10);
    const year = parseInt(yy, 10);
    if (month < 1 || month > 12) return false;
    const currentYear = new Date().getFullYear() % 100;
    return (year >= currentYear && year <= currentYear + 10);
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardName.trim()) {
      toast.error("Please enter the cardholder name");
      return;
    }
    
    if (!isValidCardNumber(cardNumber)) {
      toast.error("Invalid card number. Please check again");
      return;
    }
    
    if (!isValidExpiry(expiry)) {
      toast.error("Invalid expiry date. Format: MM/YY");
      return;
    }
    
    if (cvv.length !== 3 || !/^\d{3}$/.test(cvv)) {
      toast.error("CVV must be exactly 3 digits");
      return;
    }
    
    // Process payment
    setIsProcessing(true);
    try {
      // In a real application, this would call a payment API
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enroll in the course
      if (id) {
        await courseService.enrollInCourse(id);
        toast.success("Successfully enrolled in the course!");
        navigate(`/course-player/${id}`);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll in the course");
    } finally {
      setIsProcessing(false);
    }
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">CA</span>
            </div>
            <span>CustomAcademy</span>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6 text-gray-300">
            <Button variant="ghost" onClick={() => navigate("/")} className="hover:text-white">
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("/catalog")} className="hover:text-white">
              Courses
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row min-h-[80vh] items-center justify-center p-6">
        {/* Checkout Form Container */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md transition-transform duration-300 transform hover:shadow-2xl hover:scale-[1.01]">
          <h2 className="text-xl font-bold mb-4">Complete Your Purchase</h2>
          <div className="mb-4 bg-gray-700 p-3 rounded-lg">
            <h3 className="font-medium text-white">{course.title}</h3>
            <div className="flex justify-between items-center mt-1">
              <span>Price:</span>
              <span className="font-semibold">${course.price.toFixed(2)}</span>
            </div>
          </div>
          
          <p className="mb-2 text-gray-400">Pay with credit card</p>

          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            {/* Cardholder Name */}
            <div className="mb-4">
              <Label htmlFor="cardName" className="text-gray-300 mb-1">
                Card Holder Full Name
              </Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                maxLength={26}
                className="bg-gray-700 border-gray-600"
                placeholder="Enter your full name"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Card Number */}
            <div className="mb-4">
              <Label htmlFor="cardNumber" className="text-gray-300 mb-1">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="bg-gray-700 border-gray-600"
                placeholder="0000 0000 0000 0000"
                disabled={isProcessing}
                required
              />
            </div>

            <div className="flex gap-4">
              {/* Expiry Date */}
              <div className="w-1/2">
                <Label htmlFor="expiry" className="text-gray-300 mb-1">
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  value={expiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  className="bg-gray-700 border-gray-600"
                  placeholder="MM/YY"
                  disabled={isProcessing}
                  required
                />
              </div>

              {/* CVV */}
              <div className="w-1/2">
                <Label htmlFor="cvv" className="text-gray-300 mb-1">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  maxLength={3}
                  className="bg-gray-700 border-gray-600"
                  placeholder="CVV"
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay $${course.price.toFixed(2)}`}
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-gray-400 text-center">
            This is a demo application. No real payments will be processed.
          </p>
        </div>

        {/* Course Summary */}
        <div className="hidden md:block ml-12 mt-8 md:mt-0 w-80">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="font-bold mb-2">Order Summary</h3>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
              <span>Course:</span>
              <span className="font-medium">{course.title}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
              <span>Original Price:</span>
              <span>${course.originalPrice ? course.originalPrice.toFixed(2) : course.price.toFixed(2)}</span>
            </div>
            {course.originalPrice > course.price && (
              <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
                <span>Discount:</span>
                <span className="text-green-400">-${(course.originalPrice - course.price).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg">${course.price.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 text-sm text-gray-400">
              <p className="mb-1">✓ 30-day money-back guarantee</p>
              <p className="mb-1">✓ Full lifetime access</p>
              <p>✓ Access on mobile and TV</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-auto">
        <div className="container mx-auto flex justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-2">
              <span className="font-bold text-white">CA</span>
            </div>
            <p>© 2025 CustomAcademy, Inc.</p>
          </div>
          <div className="flex items-center">
            <div className="px-4">
              <a href="#" className="hover:text-white">About Us</a>
            </div>
            <div className="px-4">
              <a href="#" className="hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
