'use client';

import React, { useEffect } from 'react';
import { useWalkthrough } from '@/components/ui/walkthrough-spotlight';
import { STUDENT_WALKTHROUGH_STEPS } from '@/lib/walkthrough/student-tour-steps';

export const STUDENT_TOUR_STORAGE_KEY = 'arenafit_student_spotlight_tour_v2';

export function StudentTourTrigger() {
  const { startTour, isActive } = useWalkthrough();

  useEffect(() => {
    // Abrir automaticamente no primeiro acesso do aluno
    const hasSeenTour = localStorage.getItem(STUDENT_TOUR_STORAGE_KEY);
    if (!hasSeenTour && !isActive) {
      const timer = setTimeout(() => {
        startTour(STUDENT_WALKTHROUGH_STEPS, STUDENT_TOUR_STORAGE_KEY);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [startTour, isActive]);

  return null;
}
