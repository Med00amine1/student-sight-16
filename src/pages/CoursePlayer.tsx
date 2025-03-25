
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursePlayerService, CourseContent, Lecture } from '@/services/course-player.service';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, CheckCircle, Lock, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const CoursePlayer = () => {
  const { courseId = '' } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState('presentation');
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [currentLecture, setCurrentLecture] = useState<number>(0);
  const [newQuestion, setNewQuestion] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  
  const { data: courseContent, isLoading, error } = useQuery({
    queryKey: ['courseContent', courseId],
    queryFn: () => coursePlayerService.getCourseContent(courseId),
  });

  // Toggle section open/closed
  const toggleSection = (sectionId: string) => {
    if (openSections.includes(sectionId)) {
      setOpenSections(openSections.filter(id => id !== sectionId));
    } else {
      setOpenSections([...openSections, sectionId]);
    }
  };

  // Select a specific lecture
  const selectLecture = (sectionIndex: number, lectureIndex: number) => {
    setCurrentSection(sectionIndex);
    setCurrentLecture(lectureIndex);
    setQuizAnswers({});
    setQuizChecked(false);
  };

  // Current lecture data
  const getCurrentLecture = (): Lecture | null => {
    if (!courseContent) return null;
    const section = courseContent.sections[currentSection];
    if (!section) return null;
    return section.lectures[currentLecture] || null;
  };

  // Mark lecture as completed
  const markAsCompleted = () => {
    if (!courseContent) return;
    coursePlayerService.markLectureCompleted(
      courseId,
      currentSection,
      currentLecture
    );
    
    // Optimistically update the UI
    const updatedSections = [...courseContent.sections];
    updatedSections[currentSection].lectures[currentLecture].completed = true;
  };

  // Save notes
  const saveNotes = (notes: string) => {
    if (!courseContent) return;
    coursePlayerService.saveNotes(
      courseId,
      currentSection,
      currentLecture,
      notes
    );
  };

  // Ask a question
  const askQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !courseContent) return;
    
    coursePlayerService.askQuestion(
      courseId,
      currentSection,
      currentLecture,
      newQuestion
    );
    
    // Optimistically update UI
    const currentLectureData = getCurrentLecture();
    if (currentLectureData) {
      currentLectureData.qna.push({
        id: Date.now(),
        question: newQuestion,
        answer: "Pending instructor response..."
      });
    }
    
    setNewQuestion('');
  };

  // Check quiz answers
  const checkQuiz = () => {
    setQuizChecked(true);
  };

  // Calculate section duration
  const getSectionDuration = (sectionIndex: number): string => {
    if (!courseContent) return "0 hr";
    const section = courseContent.sections[sectionIndex];
    if (!section) return "0 hr";
    
    const totalMinutes = section.lectures.reduce((total, lecture) => total + lecture.duration, 0);
    return `${(totalMinutes / 60).toFixed(1)} hr`;
  };

  // Initialize first section as open
  useEffect(() => {
    if (courseContent && courseContent.sections.length > 0 && openSections.length === 0) {
      setOpenSections([courseContent.sections[0].id]);
    }
  }, [courseContent, openSections.length]);

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading course content...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading course: {(error as Error).message}</div>;
  if (!courseContent) return <div className="p-4">No course content available</div>;

  const currentLectureData = getCurrentLecture();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Navigation header */}
      <header className="bg-sidebar p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <img src="/placeholder.svg" alt="CustomAcademy Logo" className="h-8 w-8" />
          <span className="font-semibold text-xl">CustomAcademy</span>
        </div>
        <div>
          <Button variant="default" size="sm" asChild>
            <a href="/index">My Courses</a>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`bg-sidebar border-r transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-0"
          } overflow-hidden`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-bold text-lg">Course Content</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
            {courseContent.sections.map((section, sIndex) => (
              <div key={section.id} className="mb-2">
                <div 
                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted rounded"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="font-medium text-sm">
                    <span>{`Section ${sIndex + 1}: ${section.title}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {getSectionDuration(sIndex)}
                    </span>
                    {openSections.includes(section.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {openSections.includes(section.id) && (
                  <div className="ml-2 mt-1 space-y-1">
                    {section.lectures.map((lecture, lIndex) => (
                      <div 
                        key={lecture.id}
                        className={`
                          flex items-center justify-between p-2 text-sm cursor-pointer rounded
                          border-l-2 pl-3 hover:bg-muted
                          ${currentSection === sIndex && currentLecture === lIndex
                            ? "border-primary bg-muted/50"
                            : "border-transparent"
                          }
                        `}
                        onClick={() => selectLecture(sIndex, lIndex)}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {lecture.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="truncate">{lecture.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{lecture.duration} min</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Content toggle & course progress */}
          <div className="p-4 flex items-center justify-between bg-background border-b">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
              <span>Course Content</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 h-2 w-36 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full" 
                  style={{ width: `${courseContent.completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm">{courseContent.completionPercentage}% complete</span>
            </div>
          </div>

          {/* Video player and content */}
          <div className="p-4">
            {/* Video player */}
            <div className="bg-black rounded-lg overflow-hidden h-96 mb-4 flex items-center justify-center">
              {currentLectureData?.videoUrl ? (
                <video
                  className="w-full h-full object-contain"
                  src={currentLectureData.videoUrl}
                  controls
                  onEnded={markAsCompleted}
                ></video>
              ) : (
                <div className="text-muted-foreground">No video available for this lecture</div>
              )}
            </div>

            {/* Lecture title */}
            <h1 className="text-xl font-bold mb-4">
              {currentLectureData?.title || "Select a lecture"}
            </h1>

            {/* Content tabs */}
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4 border-b rounded-none bg-transparent px-0 h-auto">
                <TabsTrigger 
                  value="presentation"
                  className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Presentation
                </TabsTrigger>
                <TabsTrigger 
                  value="qna"
                  className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Q & A
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  My Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="annonces"
                  className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Announcements
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger 
                  value="tools"
                  className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Tools
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presentation" className="mt-0">
                <p className="text-muted-foreground">
                  {currentLectureData?.description || "No description available for this lecture."}
                </p>
              </TabsContent>

              <TabsContent value="qna" className="mt-0">
                <h2 className="font-bold mb-2">Questions & Answers</h2>
                {currentLectureData?.qna && currentLectureData.qna.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {currentLectureData.qna.map(q => (
                      <div key={q.id} className="bg-muted p-3 rounded">
                        <p className="font-medium">{q.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">{q.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4">No questions yet for this lecture.</p>
                )}
                
                <form onSubmit={askQuestion} className="flex gap-2">
                  <Input
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1"
                  />
                  <Button type="submit">Ask</Button>
                </form>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <h2 className="font-bold mb-2">My Notes</h2>
                <Textarea
                  value={currentLectureData?.notes || ""}
                  onChange={e => {
                    if (currentLectureData) {
                      currentLectureData.notes = e.target.value;
                      saveNotes(e.target.value);
                    }
                  }}
                  placeholder="Write your notes here..."
                  className="min-h-[200px]"
                />
              </TabsContent>

              <TabsContent value="annonces" className="mt-0">
                <h2 className="font-bold mb-2">Announcements</h2>
                {courseContent.annonces.length > 0 ? (
                  <div className="space-y-3">
                    {courseContent.annonces.map(ann => (
                      <div key={ann.id} className="bg-muted p-3 rounded">
                        <h3 className="font-medium">{ann.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{ann.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No announcements for this course yet.</p>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <h2 className="font-bold mb-2">Student Reviews</h2>
                {courseContent.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {courseContent.reviews.map(rev => (
                      <div key={rev.id} className="bg-muted p-3 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rev.user}</span>
                          <span className="text-amber-500">{rev.rating} ★</span>
                        </div>
                        <p className="text-sm mt-1">{rev.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rev.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews for this course yet.</p>
                )}
              </TabsContent>

              <TabsContent value="tools" className="mt-0">
                <h2 className="font-bold mb-2">Learning Tools</h2>
                <p className="text-muted-foreground">
                  Additional resources like sample code, reading materials, and external links
                  will appear here when available.
                </p>
              </TabsContent>
            </Tabs>

            {/* Quiz Section */}
            {currentLectureData?.quiz && currentLectureData.quiz.questions.length > 0 && (
              <div className="mt-8 bg-muted p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-4">Quiz for this Lecture</h2>
                <div className="space-y-4">
                  {currentLectureData.quiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-2">
                      <p className="font-medium">Q{qIndex + 1}: {question.question}</p>
                      <div className="space-y-1 ml-4">
                        {question.options.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`quiz_q${qIndex}`}
                              value={option}
                              checked={quizAnswers[qIndex] === option}
                              onChange={() => {
                                setQuizAnswers({
                                  ...quizAnswers,
                                  [qIndex]: option
                                });
                              }}
                              className="h-4 w-4"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      {quizChecked && (
                        <div>
                          {quizAnswers[qIndex] === question.correctAnswer ? (
                            <p className="text-green-500 text-sm">Correct!</p>
                          ) : quizAnswers[qIndex] ? (
                            <p className="text-red-500 text-sm">
                              Incorrect. The correct answer is: {question.correctAnswer}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={checkQuiz} 
                  className="mt-4"
                >
                  Submit Quiz
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-sidebar text-muted-foreground py-4 border-t">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/placeholder.svg" alt="Logo" className="h-6 w-6" />
            <p className="text-sm">© 2025 CustomAcademy, Inc.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-sm hover:text-foreground">About Us</a>
            <a href="#" className="text-sm hover:text-foreground">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoursePlayer;
