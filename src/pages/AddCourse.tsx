
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Image as ImageIcon, X } from "lucide-react";

export default function AddCourse() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    status: false,
    cover: null as File | null
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setCourseData((prev) => ({ ...prev, category: value }));
  };

  const handleStatusChange = (checked: boolean) => {
    setCourseData((prev) => ({ ...prev, status: checked }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCourseData((prev) => ({ ...prev, cover: file }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCourseData((prev) => ({ ...prev, cover: null }));
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!courseData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a course title",
        variant: "destructive"
      });
      return;
    }

    if (!courseData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a course description",
        variant: "destructive"
      });
      return;
    }

    if (!courseData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call to save course
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Course Created",
        description: "Your course has been created successfully",
      });
      
      // Reset form
      setCourseData({
        title: "",
        description: "",
        category: "",
        status: false,
        cover: null
      });
      setCoverPreview(null);
      
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Create a New Course</CardTitle>
          <CardDescription>
            Fill in the form below to create a new course for your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Introduction to Web Development"
                    value={courseData.title}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide a detailed description of your course..."
                    rows={4}
                    value={courseData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={courseData.category} onValueChange={handleSelectChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Course Status</Label>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium">Publish Now</span>
                      <p className="text-xs text-muted-foreground">Make this course available to students</p>
                    </div>
                    <Switch
                      id="status"
                      checked={courseData.status}
                      onCheckedChange={handleStatusChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Course Cover Image</Label>
                {coverPreview ? (
                  <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted rounded-md p-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-muted/50 rounded-full">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</p>
                      </div>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById("cover")?.click()}
                      >
                        <Upload size={16} className="mr-2" />
                        Select Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => {
                setCourseData({
                  title: "",
                  description: "",
                  category: "",
                  status: false,
                  cover: null
                });
                setCoverPreview(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
