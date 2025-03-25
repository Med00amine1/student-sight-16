
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Layout() {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setPageTitle("Dashboard");
        break;
      case "/add-course":
        setPageTitle("Add Course");
        break;
      case "/my-courses":
        setPageTitle("My Courses");
        break;
      case "/students":
        setPageTitle("Students Enrolled");
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
