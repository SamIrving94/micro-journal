'use client';

import { type ChangeEvent } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password';
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input = ({
  type = 'text',
  label,
  error,
  value,
  onChange
}: InputProps) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className={`
        w-full px-3 py-2 border rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-500' : 'border-gray-300'}
      `}
    />
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
); 