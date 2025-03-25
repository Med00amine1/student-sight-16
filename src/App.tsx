
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import AddCourse from "@/pages/AddCourse";
import MyCourses from "@/pages/MyCourses";
import CourseDetail from "@/pages/CourseDetail";
import CoursePlayer from "@/pages/CoursePlayer";
import StudentsEnrolled from "@/pages/StudentsEnrolled";
import CourseCatalog from "@/pages/CourseCatalog";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Authenticated user routes */}
          <Route path="/index" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          {/* Course player route */}
          <Route path="/course-player/:courseId" element={
            <ProtectedRoute>
              <CoursePlayer />
            </ProtectedRoute>
          } />
          
          {/* Teacher/Dashboard routes */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-course" element={<AddCourse />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/students" element={<StudentsEnrolled />} />
            <Route path="/catalog" element={<CourseCatalog />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
