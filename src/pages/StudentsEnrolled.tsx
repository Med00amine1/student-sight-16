
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Course,
  Student,
  fetchCourses,
  fetchStudentsByCourse,
} from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Mail, Download, Filter } from "lucide-react";

export default function StudentsEnrolled() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>(
    searchParams.get("courseId") || ""
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await fetchCourses();
        setCourses(coursesData);

        // If no course is selected, select the first active one
        if (!selectedCourse && coursesData.length > 0) {
          const firstActiveCourse = coursesData.find(
            (course) => course.status === "active"
          );
          if (firstActiveCourse) {
            setSelectedCourse(firstActiveCourse.id);
            setSearchParams({ courseId: firstActiveCourse.id });
          }
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadCourses();
  }, [toast, selectedCourse, setSearchParams]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourse) {
        setStudents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchStudentsByCourse(selectedCourse);
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedCourse, toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSearchParams({ courseId: value });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title : "Unknown Course";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses
                .filter((course) => course.status === "active")
                .map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-[250px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter size={14} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>
            Students Enrolled {selectedCourse && `in ${getCourseName(selectedCourse)}`}
          </CardTitle>
          <CardDescription>
            Manage and view the progress of your enrolled students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="text-sm text-muted-foreground">Loading students...</p>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center">
                          <span className="font-medium text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="font-medium">{student.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.joinDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="h-2 w-24" />
                        <span className="text-sm">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Mail size={14} className="mr-2" />
                        Contact
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              {selectedCourse ? (
                <>
                  <h3 className="text-lg font-medium mb-1">No students enrolled</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No students match your search criteria"
                      : "There are no students enrolled in this course yet"}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-1">No course selected</h3>
                  <p className="text-muted-foreground">
                    Please select a course to view enrolled students
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
