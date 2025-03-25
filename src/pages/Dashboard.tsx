
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  LineChart, 
  BarChart4, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from "lucide-react";
import { Course, Metric, fetchCourses, fetchMetrics } from "@/lib/mock-data";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, metricsData] = await Promise.all([
          fetchCourses(),
          fetchMetrics()
        ]);
        
        setCourses(coursesData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Helper function to render the icon for each metric card
  const renderMetricIcon = (iconName: string) => {
    switch (iconName) {
      case "courses":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "students":
        return <Users className="w-5 h-5 text-green-500" />;
      case "engagement":
        return <LineChart className="w-5 h-5 text-purple-500" />;
      case "completion":
        return <BarChart4 className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  // Helper function to render the change indicator for each metric
  const renderChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-sm text-green-500">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span>{change}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-sm text-red-500">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          <span>{Math.abs(change)}%</span>
        </div>
      );
    } else {
      return <span className="text-sm text-gray-500">No change</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className="p-2 bg-muted/50 rounded-full">
                {renderMetricIcon(metric.icon)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.icon === "engagement" ? `${metric.value}h` : metric.icon === "completion" ? `${metric.value}%` : metric.value}
              </div>
              <div className="flex items-center justify-between mt-2">
                {renderChangeIndicator(metric.change)}
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Courses Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Courses</CardTitle>
            <Link to="/my-courses" className="text-sm text-blue-500 hover:text-blue-700 transition-colors">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={course.cover} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {course.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Users size={12} />
                        <span>{course.enrolled} students</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <BookOpen size={12} />
                        <span>{course.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No courses found</p>
                <Link 
                  to="/add-course"
                  className="text-sm text-blue-500 hover:text-blue-700 transition-colors mt-2 inline-block"
                >
                  Add your first course
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Course Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.filter(c => c.status === 'active').slice(0, 3).map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 100)}%</span>
                  </div>
                  <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Review assignment submissions", course: "Introduction to Web Development", due: "Today" },
                { title: "Update course materials", course: "Advanced React Techniques", due: "Tomorrow" },
                { title: "Schedule Q&A session", course: "Data Science with Python", due: "3 days" }
              ].map((task, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-muted/50 rounded-full">
                    <Clock size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{task.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{task.course}</span>
                      <span className="text-xs font-medium text-amber-600">{task.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
