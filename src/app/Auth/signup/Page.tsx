'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';

type SignupStep = 'phone' | 'verification' | 'preferences';

interface UserPreferences {
  journalTime: string;
  timezone: string;
}

function SignupPage() {
  // Define all state variables at the top
  const [step, setStep] = useState<SignupStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    journalTime: '20:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const router = useRouter();

  // Handle phone submission
  const handlePhoneSubmit = () => {
    setStep('verification');
  };

  // Handle verification code
  const handleVerification = () => {
    setStep('preferences');
  };

  // Handle preferences submission
  const handlePreferences = () => {
    router.push('/journal');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Phone input step */}
        {step === 'phone' && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Enter your number</h1>
              <p className="text-gray-600">We'll send you a verification code via WhatsApp</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="+1234567890"
                />
              </div>
              <button
                onClick={handlePhoneSubmit}
                className="w-full bg-orange-600 text-white py-2 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Verification step */}
        {step === 'verification' && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Enter verification code</h1>
              <p className="text-gray-600">Check your WhatsApp for the code</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl"
                maxLength={6}
              />
              <button
                onClick={handleVerification}
                className="w-full bg-orange-600 text-white py-2 rounded-lg"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Preferences step */}
        {step === 'preferences' && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Set your preferences</h1>
              <p className="text-gray-600">When would you like your daily prompt?</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="time"
                  value={preferences.journalTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, journalTime: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">New York</option>
                  <option value="Europe/London">London</option>
                  {/* Add more timezone options as needed */}
                </select>
              </div>
              <button
                onClick={handlePreferences}
                className="w-full bg-orange-600 text-white py-2 rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Progress indicators */}
        <div className="flex gap-2 mt-8">
          {['phone', 'verification', 'preferences'].map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                i === ['phone', 'verification', 'preferences'].indexOf(step) 
                  ? 'bg-orange-600' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
