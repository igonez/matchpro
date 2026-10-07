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
    default: 'bg-white/10 text-white border-white/20',
    secondary: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    destructive: 'bg-zinc-900 text-zinc-400 border-zinc-700',
    outline: 'text-zinc-200 border-zinc-700',
    success: 'bg-white/15 text-white border-white/30',
    warning: 'bg-zinc-800 text-zinc-200 border-zinc-600',
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
