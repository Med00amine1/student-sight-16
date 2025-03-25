
import { Bell, Search, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReactNode, useState } from "react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const [hasNotifications, setHasNotifications] = useState(true);
  const [hasMessages, setHasMessages] = useState(true);
  
  return (
    <header className="border-b border-border py-3 px-6 bg-white flex items-center sticky top-0 z-10">
      <h1 className="text-xl font-medium text-slate-900">{title}</h1>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search courses, students..." 
            className="pl-9 w-[260px] h-9 bg-muted/30 border-none focus-visible:ring-1" 
          />
        </div>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-9 px-3 bg-transparent">Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[400px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500 to-purple-900 p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mt-4 mb-2 text-lg font-medium text-white">
                          CustomAcademy
                        </div>
                        <p className="text-sm leading-tight text-white/90">
                          Your all-in-one platform for creating and selling online courses.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <a href="/dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100">
                      <div className="text-sm font-medium leading-none">Dashboard</div>
                      <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                        Overview of your courses and performance
                      </p>
                    </a>
                  </li>
                  <li>
                    <a href="/add-course" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100">
                      <div className="text-sm font-medium leading-none">Add Course</div>
                      <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                        Create new courses to share with students
                      </p>
                    </a>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare size={18} />
            {hasMessages && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={18} />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Button>
          
          <div className="hidden sm:flex items-center gap-2 border-l pl-3 border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
              <span className="font-medium text-purple-700">T</span>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </header>
  );
}
