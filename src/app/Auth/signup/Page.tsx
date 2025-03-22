'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Clock, Calendar } from 'lucide-react';
import { signUp, updateUserPreferences, getSession } from '@/lib/supabase';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';

type SignupStep = 'details' | 'verify' | 'preferences';

interface UserPreferences {
  journalTime: string;
  timezone: string;
}

function SignupPage() {
  const [step, setStep] = useState<SignupStep>('details');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    journalTime: '20:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const router = useRouter();

  const handleDetailsSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Starting signup process...');

      if (!email || !password || !confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      console.log('Validations passed, attempting to create account...');

      // Create account with email and password
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      console.log('Signup response:', data);

      if (data.session) {
        console.log('Session created, moving to preferences...');
        setStep('preferences');
      } else {
        console.log('No session, verification needed...');
        setStep('verify');
      }
    } catch (err) {
      console.error('Error in handleDetailsSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferences = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Getting session...');
      const session = await getSession();
      
      if (!session?.user?.id) {
        console.error('No session found');
        throw new Error('Session expired. Please try again.');
      }

      console.log('Updating preferences for user:', session.user.id);
      await updateUserPreferences(session.user.id, {
        journal_time: preferences.journalTime,
        timezone: preferences.timezone
      });

      console.log('Preferences updated, redirecting to journal...');
      router.push('/journal');
    } catch (err) {
      console.error('Error in handlePreferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Progress Steps */}
        <div className="w-full mb-8">
          <div className="flex justify-between relative">
            {['details', 'verify', 'preferences'].map((s, i) => (
              <div 
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 text-base font-medium
                  ${step === s ? 'bg-orange-600 text-white' : 
                    i < ['details', 'verify', 'preferences'].indexOf(step) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-700'}`}
                aria-current={step === s ? 'step' : undefined}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Details step */}
        {step === 'details' && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Create Account</h1>
              <p className="text-gray-700 text-base">Enter your details to get started</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="sr-only">Email address</label>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10"
                  placeholder="you@example.com"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10"
                  placeholder="Create a password"
                />
              </div>
              <div className="relative">
                <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10"
                  placeholder="Confirm password"
                />
              </div>
              <Button
                onClick={handleDetailsSubmit}
                disabled={isLoading || !email || !password || !confirmPassword}
                loading={isLoading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Continue'}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verify step */}
        {step === 'verify' && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Verify Your Email</h1>
              <p className="text-gray-700 text-base">
                We've sent a verification link to {email}. Click the link to continue.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                After verifying your email, you'll be redirected to set your preferences.
              </p>
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
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="time"
                  value={preferences.journalTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, journalTime: e.target.value }))}
                  className="w-full pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 bg-white text-gray-900"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">New York</option>
                  <option value="America/Chicago">Chicago</option>
                  <option value="America/Denver">Denver</option>
                  <option value="America/Los_Angeles">Los Angeles</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
              <Button
                onClick={handlePreferences}
                disabled={isLoading}
                loading={isLoading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignupPage;
