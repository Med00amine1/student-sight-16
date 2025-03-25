
import { toast } from 'sonner';

/**
 * Service to track video progress and handle video events
 */
export const videoTrackerService = {
  /**
   * Track video progress and send it to the server
   */
  trackProgress(
    courseId: string, 
    sectionIndex: number, 
    lectureIndex: number, 
    progressPercent: number
  ): Promise<void> {
    return fetch(`/api/course/${courseId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionIndex,
        lectureIndex,
        progressPercent
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to save progress');
    })
    .catch(error => {
      console.error('Error tracking video progress:', error);
      // Silent failure - don't show toast for every progress update
    });
  },

  /**
   * Track when a video has been started
   */
  trackVideoStart(
    courseId: string,
    sectionIndex: number,
    lectureIndex: number
  ): Promise<void> {
    return fetch(`/api/course/${courseId}/video-start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionIndex,
        lectureIndex
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to track video start');
    })
    .catch(error => {
      console.error('Error tracking video start:', error);
    });
  },

  /**
   * Track when a quiz has been completed
   */
  trackQuizCompletion(
    courseId: string,
    sectionIndex: number,
    lectureIndex: number,
    score: number,
    totalQuestions: number
  ): Promise<void> {
    return fetch(`/api/course/${courseId}/quiz-completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionIndex,
        lectureIndex,
        score,
        totalQuestions
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to save quiz results');
      return response.json();
    })
    .then(data => {
      toast.success(`Quiz completed with score: ${score}/${totalQuestions}`);
    })
    .catch(error => {
      console.error('Error saving quiz completion:', error);
      toast.error('Failed to save quiz results');
    });
  }
};
