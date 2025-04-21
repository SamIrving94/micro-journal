'use client';

import React, { useState } from 'react';
import { UserPreferences } from '@/schemas/preferences';

interface WhatsAppVerificationProps {
  preferences: UserPreferences;
  onVerified: (phoneNumber: string) => void;
}

export function WhatsAppVerification({ preferences, onVerified }: WhatsAppVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(preferences.phone_number || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      setIsVerificationSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone_number: phoneNumber,
          verification_code: verificationCode
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }
      
      // Success! Notify parent component
      onVerified(phoneNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleVerification = () => {
    setIsVerifying(!isVerifying);
    setError(null);
    setVerificationCode('');
    setIsVerificationSent(false);
  };

  // Already verified
  if (preferences.whatsapp_verified && preferences.phone_number && !isVerifying) {
    return (
      <div className="mt-4 sm:flex sm:items-center">
        <div className="sm:flex-grow">
          <p className="text-sm text-gray-500">
            WhatsApp verified for: <span className="font-medium">{preferences.phone_number}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={toggleVerification}
          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Change Number
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!isVerifying && !preferences.whatsapp_verified && (
        <button
          type="button"
          onClick={toggleVerification}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Verify WhatsApp
        </button>
      )}

      {isVerifying && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900">
            {isVerificationSent ? 'Enter Verification Code' : 'Verify Your WhatsApp Number'}
          </h3>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
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
          
          {!isVerificationSent ? (
            <form onSubmit={handleSendVerification}>
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number (with country code)
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone_number"
                    id="phone_number"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your full phone number including country code (e.g., +1 for US)
                </p>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={toggleVerification}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div>
                <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="verification_code"
                    id="verification_code"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit code sent to your WhatsApp
                </p>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsVerificationSent(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
} 