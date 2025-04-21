'use client';

import React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  id?: string;
  className?: string;
}

// Generate time options in 30-minute increments
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  // Format for display
  const displayTime = new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return { value: time, label: displayTime };
});

export function TimePicker({ value, onChange, id, className }: TimePickerProps) {
  return (
    <select
      id={id}
      className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className || ''}`}
      value={value || '09:00'}
      onChange={(e) => onChange(e.target.value)}
    >
      {TIMES.map((time) => (
        <option key={time.value} value={time.value}>
          {time.label}
        </option>
      ))}
    </select>
  );
} 