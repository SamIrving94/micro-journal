'use client';

import React from 'react';

interface TimezonePickerProps {
  value: string;
  onChange: (timezone: string) => void;
  id?: string;
  className?: string;
}

// List of common timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

export function TimezonePicker({ value, onChange, id, className }: TimezonePickerProps) {
  return (
    <select
      id={id}
      className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className || ''}`}
      value={value || 'UTC'}
      onChange={(e) => onChange(e.target.value)}
    >
      {TIMEZONES.map((timezone) => (
        <option key={timezone.value} value={timezone.value}>
          {timezone.label}
        </option>
      ))}
    </select>
  );
} 