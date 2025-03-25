
import React, { useEffect, useRef, useState } from 'react';
import { videoTrackerService } from '@/services/video-tracker.service';

interface VideoPlayerProps {
  courseId: string;
  sectionIndex: number;
  lectureIndex: number;
  videoUrl: string;
  onComplete: () => void;
}

export function VideoPlayer({
  courseId,
  sectionIndex,
  lectureIndex,
  videoUrl,
  onComplete
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Track when video is played
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handlePlay = () => {
      setIsPlaying(true);
      videoTrackerService.trackVideoStart(courseId, sectionIndex, lectureIndex);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete();
    };
    
    const handleTimeUpdate = () => {
      if (!videoElement) return;
      
      const currentProgress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(currentProgress);
      
      // Track progress every 10 seconds
      if (Math.floor(videoElement.currentTime) % 10 === 0) {
        videoTrackerService.trackProgress(
          courseId, 
          sectionIndex, 
          lectureIndex, 
          currentProgress
        );
      }
    };
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [courseId, sectionIndex, lectureIndex, onComplete]);
  
  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        controls
      />
      
      {/* Optional custom progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
        <div 
          className="h-full bg-primary" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
