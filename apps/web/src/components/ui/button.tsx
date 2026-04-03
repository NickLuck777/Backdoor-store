'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-[0_0_20px_rgba(0,48,135,0.4)] hover:shadow-[0_0_28px_rgba(0,112,209,0.5)]',
  ghost:
    'bg-transparent text-foreground hover:bg-white/10 active:bg-white/5',
  outline:
    'border border-border bg-transparent text-foreground hover:border-accent-hover hover:text-accent-hover hover:bg-accent/10',
  destructive:
    'bg-discount-red text-white hover:bg-[#CC0000] active:scale-[0.98] shadow-[0_0_20px_rgba(255,23,68,0.3)]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-7 text-base rounded-xl gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-40',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
