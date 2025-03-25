import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Course } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart4,
  Edit 
} from "lucide-react";
import { courseService } from "@/services";
import { toast } from "sonner";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast: uiToast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await courseService.getCourseById(id);
        setCourse(data);
      } catch (error) {
        console.error("Failed to load course:", error);
        uiToast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [id, uiToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/my-courses">
            <ArrowLeft size={16} className="mr-2" />
            Back to My Courses
          </Link>
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Course not found</h3>
              <p className="text-muted-foreground mb-4">
                The course you're looking for doesn't exist or has been deleted.
              </p>
              <Button asChild>
                <Link to="/my-courses">
                  Go back to My Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="outline" asChild className="mb-4">
        <Link to="/my-courses">
          <ArrowLeft size={16} className="mr-2" />
          Back to My Courses
        </Link>
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">{course.category}</p>
        </div>
        <Button asChild>
          <Link to={`/edit-course/${course.id}`}>
            <Edit size={16} className="mr-2" />
            Edit Course
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="text-primary" size={18} />
              <h3 className="text-sm font-medium">Enrolled Students</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{course.enrolled}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart4 className="text-primary" size={18} />
              <h3 className="text-sm font-medium">Completion Rate</h3>
            </div>
            <p className="text-2xl font-bold mt-2">78%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary" size={18} />
              <h3 className="text-sm font-medium">Created On</h3>
            </div>
            <p className="text-2xl font-bold mt-2">June 15, 2023</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {course.description}
                </p>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Status</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${course.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <p className="capitalize">{course.status}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Module 1: Introduction</p>
                    <p className="text-sm text-muted-foreground">3 lessons • 45 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Module 2: Core Concepts</p>
                    <p className="text-sm text-muted-foreground">5 lessons • 1 hour 20 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Module 3: Advanced Topics</p>
                    <p className="text-sm text-muted-foreground">4 lessons • 1 hour</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="students" className="pt-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  View all {course.enrolled} students enrolled in this course.
                </p>
                
                <Button asChild variant="outline">
                  <Link to={`/students?courseId=${course.id}`}>
                    <Users size={16} className="mr-2" />
                    View All Students
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
