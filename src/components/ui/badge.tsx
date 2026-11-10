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
    default: 'bg-white/[0.06] text-[#D4D4D8] border-white/10',
    secondary: 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]',
    destructive: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    outline: 'text-[#FAFAFA] border-[#27272A]',
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
