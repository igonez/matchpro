import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-[#18181B] rounded-2xl" />
          <div className="h-4 w-72 bg-[#0E0E10] rounded-xl" />
        </div>
        <div className="h-10 w-36 bg-[#18181B] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-[#0E0E10] rounded-3xl border border-[#27272A]" />
        ))}
      </div>
      <div className="h-72 bg-[#0E0E10] rounded-3xl border border-[#27272A]" />
    </div>
  );
}
