'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, History } from 'lucide-react';
import { useState } from 'react';

const ONBOARDING_STEPS = [
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const currentStepData = ONBOARDING_STEPS[currentStep];

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div 
          className="h-full bg-orange-500 transition-all duration-500"
          style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Test Button */}
      <button
        onClick={testSupabaseConnection}
        className="absolute top-4 right-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
      >
        Test Supabase
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        {/* Icon */}
        <div className={`p-8 rounded-full mb-8 ${currentStepData.bgColor}`}>
          <currentStepData.icon 
            className={`w-12 h-12 ${currentStepData.color}`} 
          />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-3">
          {currentStepData.title}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {currentStepData.description}
        </p>

        {/* Navigation */}
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

        {/* Step indicators */}
        <div className="flex gap-2 mt-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}