'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const baseClasses = 'rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : children}
    </button>
  );
}; 