import React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, id, name, autoComplete, placeholder, ...props }, ref) => {
    const generatedId = React.useId();
    const resolvedId = id || generatedId;
    const resolvedName = name || id || generatedId;
    const resolvedAutoComplete =
      autoComplete ||
      (type === 'password'
        ? 'current-password'
        : type === 'email'
        ? 'email'
        : type === 'tel'
        ? 'tel'
        : undefined);

    return (
      <input
        id={resolvedId}
        name={resolvedName}
        type={type}
        placeholder={placeholder}
        autoComplete={resolvedAutoComplete}
        aria-label={props['aria-label'] || placeholder || undefined}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[#252D3B] bg-[#1B2330] px-4 py-2 text-sm text-[#F4F6FA] placeholder:text-[#A7B0C0]/60 shadow-inner transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[#3478F6] focus-visible:ring-1 focus-visible:ring-[#3478F6]/30 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
