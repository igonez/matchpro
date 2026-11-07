import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}) {
  const variants = {
    default: 'bg-[#3478F6]/15 text-[#75A7FF] border-[#3478F6]/30',
    secondary: 'bg-[#1B2330] text-[#A7B0C0] border-[#252D3B]',
    destructive: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    outline: 'text-[#F4F6FA] border-[#252D3B]',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
