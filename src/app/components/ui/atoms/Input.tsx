'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'journal-input w-full p-4 rounded-lg border',
            'focus:ring-2 focus:ring-orange-600 focus:border-transparent',
            'placeholder:text-gray-400',
            {
              'border-clay-200': !error,
              'border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 