/**
 * Reusable button component with variant and size support.
 *
 * Variants: primary (blue), ghost (transparent), destructive (red)
 * Sizes: sm, md, lg
 */
'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: 'primary' | 'ghost' | 'destructive' | 'outline' | 'cta';
  /** Size of the button. */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Whether the button should take up the full width of its container. */
  fullWidth?: boolean;
  /** Whether the button is in a loading state. */
  isLoading?: boolean;
  /** Icon to display on the left. */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right. */
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none gap-fib-8 rounded-none';

  const variants: Record<string, string> = {
    primary:
      'bg-primary text-on-primary shadow-none hover:bg-primary/90 font-mono uppercase tracking-widest text-[11px]',
    cta:
      'bg-secondary text-on-secondary shadow-none hover:bg-secondary/90 font-mono uppercase tracking-widest text-[11px]',
    ghost:
      'text-on-surface hover:bg-surface-container font-mono uppercase tracking-widest text-[11px]',
    destructive:
      'bg-error text-on-error shadow-none hover:bg-error/90 font-mono uppercase tracking-widest text-[11px]',
    outline:
      'border border-outline-variant bg-surface text-on-surface hover:bg-surface-container font-mono uppercase tracking-widest text-[11px]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-fib-8 py-fib-5 text-[10px]',
    md: 'px-fib-13 py-fib-8 text-[11px]',
    lg: 'px-fib-21 py-fib-13 text-[12px]',
    icon: 'p-fib-8',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
      data-testid={props['data-testid'] || 'button'}
    >
      {isLoading ? (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}