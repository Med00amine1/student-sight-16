
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className = '', placeholder = 'Search for courses...' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in before searching
    if (!authService.isLoggedIn()) {
      toast.error("Please log in to search for courses");
      navigate('/login', { state: { from: location } });
      return;
    }
    
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 bg-muted/30 border-none focus-visible:ring-1"
        />
      </div>
      <Button type="submit" variant="default" size="sm">
        Search
      </Button>
    </form>
  );
}
