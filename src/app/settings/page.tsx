'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/supabase/client';
import { getUserSettings, updateUserSettings, createUserSettings } from '@/lib/services/settings';
import { UserSettingsInput } from '@/lib/types/settings';

export default function Settings() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    whatsapp: false
  });

  useEffect(() => {
    async function checkSession() {
      setLoading(true);
      try {
        const { user, error } = await getUser();
        
        if (error || !user) {
          console.error('Session check error:', error);
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // Fetch user settings
        if (user.id) {
          const { data: settings, error: settingsError } = await getUserSettings(user.id);
          
          if (settingsError) {
            console.error('Error fetching settings:', settingsError);
            setMessage({ type: 'error', text: 'Failed to load settings' });
          } else if (settings) {
            if (settings.phone_number) {
              setPhoneNumber(settings.phone_number);
            }
            if (settings.notification_preferences) {
              setNotificationPreferences(settings.notification_preferences);
            }
          }
        }
      } catch (error) {
        console.error('Error in settings page:', error);
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAttempted(true);
    
    if (!phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }
    
    if (!userId) {
      setMessage({ type: 'error', text: 'User ID not found. Please sign in again.' });
      router.push('/auth/signin');
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // First try to update in case settings already exist
      const { error: updateError } = await updateUserSettings(userId, { 
        phone_number: phoneNumber,
        notification_preferences: notificationPreferences
      });
      
      // If update fails because settings don't exist, create them
      if (updateError) {
        const settingsInput: UserSettingsInput = {
          user_id: userId,
          phone_number: phoneNumber,
          notification_preferences: notificationPreferences
        };
        
        const { error: createError } = await createUserSettings(settingsInput);
        
        if (createError) {
          throw createError;
        }
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        
        {message && (
          <div 
            className={`p-4 mb-6 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                className={`w-full px-3 py-2 border ${
                  saveAttempted && !phoneNumber.trim() ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="+1 (555) 555-5555"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {saveAttempted && !phoneNumber.trim() && (
                <p className="mt-1 text-sm text-red-600">Phone number is required</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Used for SMS and WhatsApp notifications
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <input
                  id="email-notifications"
                  type="checkbox"
                  checked={notificationPreferences.email}
                  onChange={(e) =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      email: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="email-notifications" className="ml-3 text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="sms-notifications"
                  type="checkbox"
                  checked={notificationPreferences.sms}
                  onChange={(e) =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      sms: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sms-notifications" className="ml-3 text-sm text-gray-700">
                  SMS Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="whatsapp-notifications"
                  type="checkbox"
                  checked={notificationPreferences.whatsapp}
                  onChange={(e) =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      whatsapp: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="whatsapp-notifications" className="ml-3 text-sm text-gray-700">
                  WhatsApp Notifications
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 