'use client';

import React from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, History, LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { sendWhatsAppMessage, sendJournalPrompt } from '@/lib/whatsapp';

interface OnboardingStep {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Journal Your Way",
    description: "Capture your thoughts effortlessly with daily WhatsApp prompts",
    icon: BookOpen,
    color: "text-orange-500",
    bgColor: "bg-orange-100"
  },
  {
    title: "Track Your Journey",
    description: "View and reflect on your entries with our beautiful calendar view",
    icon: Calendar,
    color: "text-blue-500",
    bgColor: "bg-blue-100"
  },
  {
    title: "Relive Your Memories",
    description: "Look back on your journey and see how far you've come",
    icon: History,
    color: "text-purple-500",
    bgColor: "bg-purple-100"
  }
];

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const currentStepData = ONBOARDING_STEPS[currentStep];
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('_test').select('*').limit(1);
      if (error) {
        console.error('Connection error:', error.message);
        alert('Connection error: ' + error.message);
      } else {
        console.log('Connection successful!', data);
        alert('Supabase connection successful!');
      }
    } catch (err) {
      console.error('Test failed:', err);
      alert('Test failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push('/auth/signup');
    }
  };

  const runTest = async (testType: 'message' | 'prompt') => {
    if (!testPhone) {
      setTestResult('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setTestResult('Running test...');

    try {
      if (testType === 'message') {
        const result = await sendWhatsAppMessage(
          testPhone,
          'Test message from MicroJournal!'
        );
        setTestResult(`Message sent successfully: ${JSON.stringify(result, null, 2)}`);
      } else {
        const result = await sendJournalPrompt(testPhone);
        setTestResult(`Prompt sent successfully: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setTestResult(`Error: ${error.message}`);
      } else {
        setTestResult('An unknown error occurred');
      }
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator: React.FC<{ index: number }> = ({ index }) => (
    <div
      className={`w-2 h-2 rounded-full transition-colors ${
        index === currentStep ? 'bg-orange-500' : 'bg-gray-200'
      }`}
    />
  );

  return (
    <div className="flex flex-col">
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        <button
          onClick={testSupabaseConnection}
          className="absolute top-4 right-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
        >
          Test Supabase
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
          <div className={`p-8 rounded-full mb-8 ${currentStepData.bgColor}`}>
            {React.createElement(currentStepData.icon, {
              className: `w-12 h-12 ${currentStepData.color}`
            })}
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-3">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {currentStepData.description}
          </p>

          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleNext}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Continue'}
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Skip
            </button>
          </div>

          <div className="flex gap-2 mt-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <StepIndicator key={index} index={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">WhatsApp Integration Test</h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => runTest('message')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Test Message
                </button>
                <button
                  onClick={() => runTest('prompt')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Test Prompt
                </button>
              </div>

              {testResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">WHATSAPP_API_URL: </span>
                <span className="text-gray-600">
                  {process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium">WHATSAPP_PHONE_ID: </span>
                <span className="text-gray-600">
                  {process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID ? 'Set' : 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium">WHATSAPP_ACCESS_TOKEN: </span>
                <span className="text-gray-600">
                  {process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN ? 'Set' : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;