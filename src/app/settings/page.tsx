'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { TimePicker } from '@/components/forms/TimePicker';
import { TimezonePicker } from '@/components/forms/TimezonePicker';
import { WhatsAppVerification } from '@/components/forms/WhatsAppVerification';
import { UserPreferences } from '@/schemas/preferences';
import { logger } from '@/lib/logger';

export default function SettingsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications_enabled: true,
    prompt_time: '09:00',
    timezone: 'UTC',
    prompt_categories: ['gratitude', 'reflection', 'learning'],
    whatsapp_verified: false,
    phone_number: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingPrompt, setTestingPrompt] = useState(false);
  const [testPromptResult, setTestPromptResult] = useState<{ success: boolean; message: string } | null>(null);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Categories available for selection
  const availableCategories = [
    { id: 'gratitude', name: 'Gratitude' },
    { id: 'reflection', name: 'Daily Reflection' },
    { id: 'learning', name: 'Learning' },
    { id: 'emotions', name: 'Emotions' },
    { id: 'future', name: 'Future Planning' },
  ];

  // Fetch current preferences
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/auth/signin');
      return;
    }
    
    fetchPreferences();
  }, [isLoaded, isSignedIn, router]);

  // Fetch preferences from API
  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/preferences');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load preferences');
      }
      
      setPreferences(data.data || preferences);
    } catch (err) {
      logger.error('Error fetching preferences', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  // Save preferences to API
  const savePreferences = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      logger.error('Error saving preferences', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Handle WhatsApp verification completion
  const handleWhatsAppVerified = (phoneNumber: string) => {
    setPreferences({
      ...preferences,
      phone_number: phoneNumber,
      whatsapp_verified: true,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences();
  };

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    if (preferences.prompt_categories.includes(categoryId)) {
      setPreferences({
        ...preferences,
        prompt_categories: preferences.prompt_categories.filter(id => id !== categoryId)
      });
    } else {
      setPreferences({
        ...preferences,
        prompt_categories: [...preferences.prompt_categories, categoryId]
      });
    }
  };

  // Handle sending a test prompt
  const handleTestPrompt = async () => {
    setTestingPrompt(true);
    setTestPromptResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/send-test-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test prompt');
      }
      
      setTestPromptResult({
        success: true,
        message: 'Test prompt sent successfully to your WhatsApp number!'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test prompt';
      setTestPromptResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setTestingPrompt(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Settings saved successfully</p>
            </div>
          </div>
        </div>
      )}
      
      {testPromptResult && (
        <div className={`mb-6 rounded-md ${testPromptResult.success ? 'bg-green-50' : 'bg-red-50'} p-4`}>
          <div className="flex">
            <div className="ml-3">
              <p className={`text-sm font-medium ${testPromptResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testPromptResult.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* WhatsApp Integration Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">WhatsApp Integration</h2>
          <p className="text-sm text-gray-500 mb-4">
            Verify your WhatsApp number to receive daily prompts and send journal entries directly through WhatsApp.
          </p>
          
          <WhatsAppVerification 
            preferences={preferences} 
            onVerified={handleWhatsAppVerified} 
          />
          
          {/* Test Daily Prompt Button (Development Only) */}
          {isDevelopment && preferences.whatsapp_verified && preferences.phone_number && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Development Testing</h3>
              <button
                type="button"
                onClick={handleTestPrompt}
                disabled={testingPrompt}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {testingPrompt ? 'Sending...' : 'Send Test Daily Prompt'}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                This will immediately send a test prompt to your WhatsApp number.
              </p>
            </div>
          )}
        </div>
        
        {/* Notification Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Daily Prompts</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">Enable daily prompts</h3>
                <p className="text-sm text-gray-500">
                  Receive daily journal prompts at your specified time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences({
                  ...preferences,
                  notifications_enabled: !preferences.notifications_enabled
                })}
                className={`${
                  preferences.notifications_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    preferences.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            
            <div>
              <label htmlFor="prompt_time" className="block text-sm font-medium text-gray-700">
                Prompt delivery time
              </label>
              <div className="mt-1">
                <TimePicker
                  id="prompt_time"
                  value={preferences.prompt_time}
                  onChange={(time) => setPreferences({ ...preferences, prompt_time: time })}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Time when you want to receive your daily prompts
              </p>
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Your timezone
              </label>
              <div className="mt-1">
                <TimezonePicker
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(timezone) => setPreferences({ ...preferences, timezone })}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Select your timezone to ensure prompts are delivered at the right time
              </p>
            </div>
          </div>
        </div>
        
        {/* Prompt Categories */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Prompt Categories</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose the types of prompts you'd like to receive
          </p>
          
          <div className="space-y-4">
            {availableCategories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  id={`category-${category.id}`}
                  name={`category-${category.id}`}
                  type="checkbox"
                  checked={preferences.prompt_categories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
            
            {preferences.prompt_categories.length === 0 && (
              <p className="text-sm text-red-500">
                Please select at least one category to receive prompts
              </p>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || preferences.prompt_categories.length === 0}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
} 