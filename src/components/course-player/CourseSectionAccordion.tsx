
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle, Lock } from 'lucide-react';
import { CourseSection } from '@/services/course-player.service';

interface CourseSectionAccordionProps {
  section: CourseSection;
  sectionIndex: number;
  isOpen: boolean;
  currentSection: number;
  currentLecture: number;
  onToggle: (index: number) => void;
  onSelectLecture: (sectionIndex: number, lectureIndex: number) => void;
}

export function CourseSectionAccordion({
  section,
  sectionIndex,
  isOpen,
  currentSection,
  currentLecture,
  onToggle,
  onSelectLecture
}: CourseSectionAccordionProps) {
  // Calculate section duration
  const getSectionDuration = (): string => {
    const totalMinutes = section.lectures.reduce((total, lecture) => total + lecture.duration, 0);
    return `${(totalMinutes / 60).toFixed(1)} hr`;
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle(sectionIndex)}
      className="mb-2"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex justify-between items-center p-2 hover:bg-muted rounded"
        >
          <div className="font-medium text-sm text-left">
            <span>{`Section ${sectionIndex + 1}: ${section.title}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {getSectionDuration()}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-2 mt-1 space-y-1">
        {section.lectures.map((lecture, lIndex) => (
          <div 
            key={lecture.id}
            className={`
              flex items-center justify-between p-2 text-sm cursor-pointer rounded
              border-l-2 pl-3 hover:bg-muted
              ${currentSection === sectionIndex && currentLecture === lIndex
                ? "border-primary bg-muted/50"
                : "border-transparent"
              }
            `}
            onClick={() => onSelectLecture(sectionIndex, lIndex)}
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
      </CollapsibleContent>
    </Collapsible>
  );
}
