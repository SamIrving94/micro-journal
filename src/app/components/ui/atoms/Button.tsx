'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'btn-primary bg-[--primary] text-white hover:bg-[--primary-hover]': variant === 'primary',
            'btn-secondary bg-clay-100 text-gray-900 hover:bg-clay-200': variant === 'secondary',
            'btn-ghost text-gray-600 hover:bg-clay-50': variant === 'ghost',
            'h-9 px-4 py-2 text-sm': size === 'sm',
            'h-10 px-4 py-2 text-base': size === 'md',
            'h-11 px-8 py-2 text-lg': size === 'lg',
          },
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };