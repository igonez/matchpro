import React from 'react';
import { StudentBottomNav } from '@/components/student/bottom-nav';

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col pb-20 relative bg-zinc-950 border-x border-zinc-900/60 shadow-2xl">
        {children}
        <StudentBottomNav />
      </div>
    </div>
  );
}
