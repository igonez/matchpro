import React from 'react';
import { StudentBottomNav } from '@/components/student/bottom-nav';
import { PwaInstallPrompt } from '@/components/student/pwa-install-prompt';
import { ReturnToCoachBanner } from '@/components/student/return-to-coach-banner';
import { WorkoutSessionProvider } from '@/lib/workout-session-context';
import { WorkoutActiveSessionHud } from '@/components/student/workout-active-session-hud';
import { StudentOnboardingTour } from '@/components/student/student-onboarding-tour';

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkoutSessionProvider>
      <div className="min-h-screen bg-black text-zinc-100 flex justify-center selection:bg-white selection:text-black">
        <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl min-h-screen flex flex-col pb-28 sm:pb-32 relative bg-zinc-950 sm:border-x border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_30px_rgba(255,255,255,0.04)]">
          <ReturnToCoachBanner />
          <PwaInstallPrompt />
          {children}
          <WorkoutActiveSessionHud />
          <StudentBottomNav />
          <StudentOnboardingTour />
        </div>
      </div>
    </WorkoutSessionProvider>
  );
}
