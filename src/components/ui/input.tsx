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
          'flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 shadow-inner transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
