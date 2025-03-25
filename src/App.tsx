
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import AddCourse from "@/pages/AddCourse";
import MyCourses from "@/pages/MyCourses";
import CourseDetail from "@/pages/CourseDetail";
import StudentsEnrolled from "@/pages/StudentsEnrolled";
import CourseCatalog from "@/pages/CourseCatalog";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
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
