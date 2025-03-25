
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Layout() {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const params = useParams();
  
  useEffect(() => {
    switch (true) {
      case location.pathname === "/":
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
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title={pageTitle} />
        
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
