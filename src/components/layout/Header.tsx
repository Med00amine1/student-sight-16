
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="border-b border-border py-4 px-6 bg-white flex items-center">
      <h1 className="text-xl font-medium">{title}</h1>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search..." 
            className="pl-9 w-[220px] h-9 bg-muted/30 border-none focus-visible:ring-1" 
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="font-medium text-gray-700">T</span>
          </div>
        </div>
        
        {children}
      </div>
    </header>
  );
}
