'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Clock, Calendar } from 'lucide-react';
import { signUp, updateUserPreferences, getSession, getUserByEmail } from '@/lib/supabase';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';

enum SignupStep {
  EMAIL = 'email',
  PASSWORD = 'password',
  VERIFY = 'verify',
  PREFERENCES = 'preferences'
}

interface UserPreferences {
  journalTime: string;
  timezone: string;
}

function SignupPage() {
  const [step, setStep] = useState<SignupStep>(SignupStep.EMAIL);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    journalTime: '20:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      // Check if user already exists
      const user = await getUserByEmail(email);
      if (user) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      // Move to password step
      setStep(SignupStep.PASSWORD);
    } catch (err: any) {
      console.error('Email check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      console.log('Validations passed, attempting to create account...');

      // Create account with email and password
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      // Move to verification step
      setStep(SignupStep.VERIFY);
    } catch (err: any) {
      console.error('Password submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferences = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="youremail@example.com"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Checking...' : 'Continue'}
      </Button>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-2"
        onClick={() => setStep(SignupStep.EMAIL)}
        disabled={loading}
      >
        Back
      </Button>
    </form>
  );

  const renderVerifyStep = () => (
    <div className="space-y-4 text-center">
      <Mail className="mx-auto h-12 w-12 text-orange-500" />
      <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
      <p className="text-gray-600">
        We've sent a confirmation email to <span className="font-medium">{email}</span>.
        Please check your inbox and click the link to verify your account.
      </p>
      <Button
        className="w-full mt-4"
        onClick={() => router.push('/auth/signin')}
      >
        Go to Sign In
      </Button>
    </div>
  );

  const renderPreferencesStep = () => (
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
          disabled={loading}
          loading={loading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case SignupStep.EMAIL:
        return renderEmailStep();
      case SignupStep.PASSWORD:
        return renderPasswordStep();
      case SignupStep.VERIFY:
        return renderVerifyStep();
      case SignupStep.PREFERENCES:
        return renderPreferencesStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-clay-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {step === SignupStep.VERIFY
            ? 'Verify Your Email'
            : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step !== SignupStep.VERIFY && (
            <>
              Already have an account?{' '}
              <a href="/auth/signin" className="font-medium text-orange-600 hover:text-orange-500">
                Sign in
              </a>
            </>
          )}
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
