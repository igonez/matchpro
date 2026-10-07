'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ActiveSession {
  missionId: string;
  missionTitle: string;
  category: 'treino' | 'cardio';
  startedAt: number; // timestamp em ms
  isPaused?: boolean;
}

interface WorkoutSessionContextType {
  activeSession: ActiveSession | null;
  startSession: (missionId: string, missionTitle: string, category: 'treino' | 'cardio') => void;
  finishSession: () => { durationSeconds: number; startedAt: string } | null;
  cancelSession: () => void;
  getElapsedSeconds: () => number;
}

const STORAGE_KEY = 'matchpro_active_workout_session';

const WorkoutSessionContext = createContext<WorkoutSessionContextType>({
  activeSession: null,
  startSession: () => {},
  finishSession: () => null,
  cancelSession: () => {},
  getElapsedSeconds: () => 0,
});

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.startedAt && parsed.missionId) {
          setActiveSession(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão de treino:', e);
    }
  }, []);

  const startSession = (missionId: string, missionTitle: string, category: 'treino' | 'cardio') => {
    const session: ActiveSession = {
      missionId,
      missionTitle,
      category,
      startedAt: Date.now(),
    };
    setActiveSession(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }
  };

  const getElapsedSeconds = () => {
    if (!activeSession) return 0;
    return Math.max(0, Math.floor((Date.now() - activeSession.startedAt) / 1000));
  };

  const finishSession = () => {
    if (!activeSession) return null;
    const durationSeconds = getElapsedSeconds();
    const startedAt = new Date(activeSession.startedAt).toISOString();
    
    // Limpa a sessão
    setActiveSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }

    return { durationSeconds, startedAt };
  };

  const cancelSession = () => {
    setActiveSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WorkoutSessionContext.Provider
      value={{
        activeSession,
        startSession,
        finishSession,
        cancelSession,
        getElapsedSeconds,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  return useContext(WorkoutSessionContext);
}
