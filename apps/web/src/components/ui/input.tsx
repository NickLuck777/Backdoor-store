import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-muted pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 bg-input border border-border rounded-xl text-foreground text-sm',
              'placeholder:text-muted',
              'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
              'hover:border-border/80',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              error ? 'border-discount-red focus:ring-discount-red' : '',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-muted flex items-center">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-discount-red text-xs px-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
