import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]';
    
    const variants = {
      default: 'bg-white text-black hover:bg-zinc-200 shadow-sm focus-visible:ring-white',
      destructive: 'bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400',
      success: 'bg-white text-black hover:bg-zinc-200 shadow-sm focus-visible:ring-white',
      outline: 'border border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800 hover:text-white focus-visible:ring-zinc-400',
      secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-zinc-500',
      ghost: 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white',
      link: 'text-white underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3 text-xs',
      lg: 'h-13 rounded-2xl px-8 text-base font-bold',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
