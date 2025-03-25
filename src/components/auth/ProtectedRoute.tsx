
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'instructor' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const location = useLocation();
  const isLoggedIn = authService.isLoggedIn();
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If specific role is required, verify it
  if (requiredRole) {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    const user = JSON.parse(userJson);
    
    // Check if user has required role
    // For instructor role, also allow if isTeacher flag is true
    const hasRequiredRole = 
      user.role === requiredRole || 
      (requiredRole === 'instructor' && user.isTeacher === true);
      
    if (!hasRequiredRole) {
      // If trying to access teacher pages but user is not a teacher, redirect to student index
      return <Navigate to="/index" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
