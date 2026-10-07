import React from 'react';
import { StudentBottomNav } from '@/components/student/bottom-nav';
import { PwaInstallPrompt } from '@/components/student/pwa-install-prompt';
import { ReturnToCoachBanner } from '@/components/student/return-to-coach-banner';
import { WorkoutSessionProvider } from '@/lib/workout-session-context';
import { WorkoutActiveSessionHud } from '@/components/student/workout-active-session-hud';

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkoutSessionProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center selection:bg-white selection:text-black">
        <div className="w-full max-w-md min-h-screen flex flex-col pb-20 relative bg-zinc-950 border-x border-zinc-900/60 shadow-2xl">
          <ReturnToCoachBanner />
          <PwaInstallPrompt />
          {children}
          <WorkoutActiveSessionHud />
          <StudentBottomNav />
        </div>
      </div>
    </WorkoutSessionProvider>
  );
}
