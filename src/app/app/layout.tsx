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
      <div className="min-h-screen bg-black text-zinc-100 flex justify-center selection:bg-white selection:text-black">
        <div className="w-full max-w-md min-h-screen flex flex-col pb-20 relative bg-zinc-950 border-x border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_30px_rgba(255,255,255,0.04)]">
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
