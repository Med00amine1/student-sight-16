
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== requiredRole && 
        !(requiredRole === 'instructor' && user.isTeacher)) {
      // If trying to access teacher pages but user is not a teacher
      return <Navigate to="/index" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
