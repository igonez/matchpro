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
      default: 'bg-[#3478F6] text-white hover:bg-[#75A7FF] border border-[#3478F6]/50 shadow-[0_8px_20px_rgba(52,120,246,0.28)] focus-visible:ring-[#3478F6]',
      destructive: 'bg-rose-500/15 border border-rose-500/35 text-rose-300 hover:bg-rose-500/25 focus-visible:ring-rose-500',
      success: 'bg-[#3478F6] text-white hover:bg-[#75A7FF] border border-[#3478F6]/50 shadow-[0_8px_20px_rgba(52,120,246,0.28)] focus-visible:ring-[#3478F6]',
      outline: 'border border-[#27272A] bg-[#18181B] text-[#FAFAFA] hover:bg-[#27272A] hover:border-[#3478F6]/40 hover:text-white focus-visible:ring-[#3478F6]',
      secondary: 'border border-[#27272A] bg-[#18181B] text-[#FAFAFA] hover:bg-[#27272A] hover:border-[#3478F6]/40 focus-visible:ring-[#3478F6]',
      ghost: 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#FAFAFA]',
      link: 'text-[#D4D4D8] underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3 text-xs',
      lg: 'h-12 min-h-[48px] rounded-2xl px-8 text-base font-bold',
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
