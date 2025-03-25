
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookPlus, 
  BookOpen, 
  Users, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItem = ({ icon, label, href, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link 
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
        isActive 
          ? "bg-sidebar-accent text-sidebar-primary font-medium" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <div className="flex items-center justify-center w-6 h-6">
        {icon}
      </div>
      <span className={cn(
        "transition-all duration-200", 
        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
      )}>
        {label}
      </span>
    </Link>
  );
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { 
      icon: <LayoutDashboard size={18} />, 
      label: "Dashboard", 
      href: "/" 
    },
    { 
      icon: <BookPlus size={18} />, 
      label: "Add Course", 
      href: "/add-course" 
    },
    { 
      icon: <BookOpen size={18} />, 
      label: "My Courses", 
      href: "/my-courses" 
    },
    { 
      icon: <Users size={18} />, 
      label: "Students Enrolled", 
      href: "/students" 
    },
  ];

  return (
    <div className={cn(
      "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-2 transition-all duration-200",
          collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <span className="font-bold text-sidebar-primary text-sm">CS</span>
          </div>
          <span className="font-medium text-sidebar-foreground">CourseSync</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={location.pathname === item.href}
            isCollapsed={collapsed}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 transition-all",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="font-medium text-gray-700">T</span>
          </div>
          <div className={cn(
            "transition-all duration-200",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            <p className="text-sm font-medium text-sidebar-foreground">Teacher's name</p>
            <p className="text-xs text-sidebar-foreground/70">Instructor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
