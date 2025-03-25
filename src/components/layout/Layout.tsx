
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Outlet, useLocation, useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; 
import { authService } from "@/services/auth.service";
import { User, BookOpen } from "lucide-react";
import { toast } from "sonner";

export function Layout() {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const params = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Teacher");
  
  useEffect(() => {
    // Get the current user name from auth service
    const name = authService.getUserName();
    if (name) setUserName(name);
    
    // Set the page title based on the current route
    switch (true) {
      case location.pathname === "/dashboard":
        setPageTitle("Dashboard");
        break;
      case location.pathname === "/add-course":
        setPageTitle("Add Course");
        break;
      case location.pathname === "/my-courses":
        setPageTitle("My Courses");
        break;
      case location.pathname === "/students":
        setPageTitle("Students Enrolled");
        break;
      case location.pathname === "/catalog":
        setPageTitle("Course Catalog");
        break;
      case location.pathname.startsWith("/course/"):
        setPageTitle("Course Details");
        break;
      default:
        setPageTitle("Dashboard");
    }
  }, [location.pathname]);
  
  const handleBackToStudent = () => {
    authService.switchToStudentMode();
    toast.success("Switched to student view");
    navigate('/index');
  };
  
  const isTeacher = authService.isTeacher();
  
  if (!isTeacher) {
    return <Navigate to="/index" replace />;
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title={pageTitle}>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Welcome, {userName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToStudent}
              className="flex items-center gap-2"
            >
              <User size={16} />
              <span className="hidden sm:inline-block">Back to Student View</span>
            </Button>
          </div>
        </Header>
        
        <main className={cn(
          "flex-1 p-6 bg-muted/20 transition-all",
          "animate-fade-in"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
