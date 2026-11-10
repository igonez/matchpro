import React from 'react';
import { PwaInstallPrompt } from '@/components/student/pwa-install-prompt';
import { ReturnToCoachBanner } from '@/components/student/return-to-coach-banner';
import { WorkoutSessionProvider } from '@/lib/workout-session-context';
import { WalkthroughProvider } from '@/components/ui/walkthrough-spotlight';
import { StudentAccessGate } from '@/components/student/student-access-gate';

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkoutSessionProvider>
      <WalkthroughProvider>
        <div className="min-h-screen bg-[#000000] text-[#FAFAFA] flex justify-center selection:bg-[#3478F6] selection:text-white overflow-x-hidden">
          <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl min-h-screen flex flex-col safe-page-pb relative bg-[#000000] sm:border-x border-[#27272A] shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_30px_rgba(52,120,246,0.06)] min-w-0 overflow-x-hidden">
            <ReturnToCoachBanner />
            <PwaInstallPrompt />
            <StudentAccessGate>
              {children}
            </StudentAccessGate>
          </div>
        </div>
      </WalkthroughProvider>
    </WorkoutSessionProvider>
  );
}
