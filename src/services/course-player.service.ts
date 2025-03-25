
import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './api.service';
import { toast } from 'sonner';

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number; // in minutes
  completed: boolean;
  notes?: string;
  quiz?: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
  };
  qna: {
    id: number;
    question: string;
    answer: string;
  }[];
}

export interface CourseSection {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface CourseContent {
  id: string;
  title: string;
  sections: CourseSection[];
  annonces: {
    id: number;
    title: string;
    content: string;
    date: string;
  }[];
  reviews: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  completionPercentage: number;
  lastWatchedSection?: number;
  lastWatchedLecture?: number;
}

export const coursePlayerService = {
  /**
   * Get course content for the player
   */
  async getCourseContent(courseId: string): Promise<CourseContent> {
    try {
      const result = await apiClient.get<CourseContent>(`${API_ENDPOINTS.courses.getById(courseId)}/content`);
      return result;
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.warning('Using mock data: API connection failed');
      // Return mock data as fallback
      return getMockCourseContent(courseId);
    }
  },

  /**
   * Mark a lecture as completed
   */
  async markLectureCompleted(courseId: string, sectionIndex: number, lectureIndex: number): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.courses.getById(courseId)}/complete-lecture`, {
        sectionIndex,
        lectureIndex
      });
      toast.success('Progress saved');
    } catch (error) {
      console.error('Error marking lecture as completed:', error);
      toast.error('Failed to save progress');
    }
  },

  /**
   * Save notes for a lecture
   */
  async saveNotes(courseId: string, sectionIndex: number, lectureIndex: number, notes: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.courses.getById(courseId)}/save-notes`, {
        sectionIndex,
        lectureIndex,
        notes
      });
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  },

  /**
   * Ask a question for a lecture
   */
  async askQuestion(courseId: string, sectionIndex: number, lectureIndex: number, question: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.courses.getById(courseId)}/ask-question`, {
        sectionIndex,
        lectureIndex,
        question
      });
      toast.success('Question submitted');
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question');
    }
  },

  /**
   * Submit quiz answers for a lecture
   */
  async submitQuizAnswers(
    courseId: string, 
    sectionIndex: number, 
    lectureIndex: number, 
    answers: Record<number, string>,
    correctAnswers: string[]
  ): Promise<void> {
    try {
      // Calculate score
      let score = 0;
      Object.keys(answers).forEach((qIndex) => {
        const index = parseInt(qIndex);
        if (answers[index] === correctAnswers[index]) {
          score++;
        }
      });

      await apiClient.post(`${API_ENDPOINTS.courses.getById(courseId)}/submit-quiz`, {
        sectionIndex,
        lectureIndex,
        answers,
        score,
        totalQuestions: correctAnswers.length
      });
      
      toast.success(`Quiz submitted: ${score}/${correctAnswers.length} correct`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  },

  /**
   * Track video progress
   */
  async trackVideoProgress(
    courseId: string,
    sectionIndex: number,
    lectureIndex: number,
    currentTime: number,
    duration: number
  ): Promise<void> {
    try {
      const progressPercent = Math.floor((currentTime / duration) * 100);
      
      await apiClient.post(`${API_ENDPOINTS.courses.getById(courseId)}/track-progress`, {
        sectionIndex,
        lectureIndex,
        progressPercent
      });
      
      // No toast notification for tracking progress as it would be too frequent
    } catch (error) {
      console.error('Error tracking progress:', error);
      // Silent failure for progress tracking
    }
  },

  /**
   * Get course completion certificate if available
   */
  async getCertificate(courseId: string): Promise<string> {
    try {
      const result = await apiClient.get<{ certificateUrl: string }>(`${API_ENDPOINTS.courses.getById(courseId)}/certificate`);
      return result.certificateUrl;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast.error('Certificate not available yet');
      return '';
    }
  }
};

// Mock data for fallback
function getMockCourseContent(courseId: string): CourseContent {
  return {
    id: courseId,
    title: "Python Mastery Course",
    completionPercentage: 35,
    lastWatchedSection: 0,
    lastWatchedLecture: 1,
    sections: [
      {
        id: "s1",
        title: "Introduction to Python",
        lectures: [
          {
            id: "l1",
            title: "Getting Started with Python",
            description: "Introduction to Python and setting up your environment",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            duration: 10,
            completed: true,
            qna: [
              {
                id: 1,
                question: "How do I install Python on Windows?",
                answer: "You can download Python from python.org and follow the installation instructions."
              }
            ],
            quiz: {
              questions: [
                {
                  question: "What is Python?",
                  options: ["A programming language", "A snake", "A game", "A web browser"],
                  correctAnswer: "A programming language"
                }
              ]
            }
          },
          {
            id: "l2",
            title: "Python Syntax Basics",
            description: "Learn the basic syntax of Python",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            duration: 15,
            completed: false,
            qna: [],
            quiz: {
              questions: [
                {
                  question: "How do you create a comment in Python?",
                  options: ["// Comment", "# Comment", "/* Comment */", "<!-- Comment -->"],
                  correctAnswer: "# Comment"
                }
              ]
            }
          }
        ]
      },
      {
        id: "s2",
        title: "Data Structures in Python",
        lectures: [
          {
            id: "l3",
            title: "Lists and Tuples",
            description: "Understanding lists and tuples in Python",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            duration: 20,
            completed: false,
            qna: [],
            quiz: {
              questions: [
                {
                  question: "Which of these is mutable?",
                  options: ["Tuple", "List", "Both", "Neither"],
                  correctAnswer: "List"
                }
              ]
            }
          }
        ]
      }
    ],
    annonces: [
      {
        id: 1,
        title: "New Programming Exercise Added",
        content: "Check out the new programming exercise in Section 2!",
        date: "2023-06-15"
      },
      {
        id: 2,
        title: "Live Q&A Session",
        content: "Join us for a live Q&A session next Friday at 7 PM EST.",
        date: "2023-06-10"
      }
    ],
    reviews: [
      {
        id: 1,
        user: "John D.",
        rating: 5,
        comment: "Great course! I learned a lot about Python.",
        date: "2023-05-20"
      },
      {
        id: 2,
        user: "Sarah M.",
        rating: 4,
        comment: "Very informative, but some sections could be more detailed.",
        date: "2023-05-15"
      }
    ]
  };
}
