'use client';

import React, { useEffect } from 'react';
import { useWalkthrough } from '@/components/ui/walkthrough-spotlight';
import { COACH_WALKTHROUGH_STEPS } from '@/lib/walkthrough/coach-tour-steps';

export const COACH_TOUR_STORAGE_KEY = 'arenafit_coach_spotlight_tour_v2';

export function CoachTourTrigger() {
  const { startTour, isActive } = useWalkthrough();

  useEffect(() => {
    // Abrir automaticamente apenas na primeira vez que o treinador acessar o dashboard
    const hasSeenTour = localStorage.getItem(COACH_TOUR_STORAGE_KEY);
    if (!hasSeenTour && !isActive) {
      const timer = setTimeout(() => {
        startTour(COACH_WALKTHROUGH_STEPS, COACH_TOUR_STORAGE_KEY);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startTour, isActive]);

  return null;
}

// Função utilitária para acionar manualmente via botão "Guia / Tour do App"
export function triggerCoachWalkthrough(startTourFn: (steps: any[], key?: string) => void) {
  startTourFn(COACH_WALKTHROUGH_STEPS, COACH_TOUR_STORAGE_KEY);
}
