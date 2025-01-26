'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';

type SignupStep = 'phone' | 'verification' | 'preferences';

interface UserPreferences {
  journalTime: string;
  timezone: string;
}

function SignupPage() {
  const [step, setStep] = useState<SignupStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [expectedCode, setExpectedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    journalTime: '20:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const router = useRouter();

  const handlePhoneSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedCode(code);

      // Send verification message via Twilio WhatsApp
      const response = await sendWhatsAppMessage(
        phoneNumber,
        `Your MicroJournal verification code is: ${code}`
      );

      if (response.status === 'failed') {
        throw new Error(response.errorMessage || 'Failed to send verification code');
      }

      // Move to verification step
      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
      console.error('Error sending verification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Debug logs
      console.log('Entered code:', verificationCode);
      console.log('Expected code:', expectedCode);
      
      // Verify the code (ensure string comparison)
      if (verificationCode.toString() !== expectedCode.toString()) {
        console.log('Code mismatch');
        throw new Error('Invalid verification code');
      }

      console.log('Code verified successfully');
      
      // Try to sign in first (in case user is returning after email confirmation)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: verificationCode,
      });

      // If sign in succeeds, user has already confirmed email
      if (signInData.session) {
        setStep('preferences');
        return;
      }

      // If not signed in, try to sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: verificationCode,
        options: {
          data: {
            phone_number: phoneNumber
          }
        }
      });

      if (authError) throw authError;

      // Check if email confirmation is required
      if (!authData.session) {
        setError(
          'Please check your email to confirm your account. Once confirmed, you can sign in again to continue.'
        );
        return;
      }

      // Create user in Supabase database if they don't exist
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select()
        .eq('phone_number', phoneNumber)
        .single();

      if (lookupError && lookupError.code !== 'PGRST116') {
        throw lookupError;
      }

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            phone_number: phoneNumber,
            email: email,
            id: authData.user?.id
          }]);

        if (insertError) throw insertError;
      }

      setStep('preferences');
    } catch (err) {
      if (err instanceof Error && err.message.includes('Email not confirmed')) {
        setError('Please check your email to confirm your account. Once confirmed, you can sign in again to continue.');
      } else {
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
      console.error('Error during verification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferences = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Update user preferences in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          journal_time: preferences.journalTime,
          timezone: preferences.timezone
        })
        .eq('phone_number', phoneNumber);

      if (updateError) throw updateError;

      // Send welcome message via Twilio WhatsApp
      const response = await sendWhatsAppMessage(
        phoneNumber,
        'Welcome to MicroJournal! You will receive your first journal prompt at your chosen time. Reply with your thoughts whenever you are ready.'
      );

      if (response.status === 'failed') {
        throw new Error(response.errorMessage || 'Failed to send welcome message');
      }

      router.push('/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Progress Steps - improved contrast */}
        <div className="w-full mb-8">
          <div className="flex justify-between relative">
            {['phone', 'verification', 'preferences'].map((s, i) => (
              <div 
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 text-base font-medium
                  ${step === s ? 'bg-orange-600 text-white' : 
                    i < ['phone', 'verification', 'preferences'].indexOf(step) 
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

        {/* Phone input step */}
        {step === 'phone' && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Create your account</h1>
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
                <label htmlFor="phone" className="sr-only">Phone number</label>
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10"
                  placeholder="+1234567890"
                />
              </div>
              <Button
                onClick={handlePhoneSubmit}
                disabled={isLoading || !phoneNumber || !email}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Continue'}
              </Button>
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
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full text-center text-2xl"
                maxLength={6}
              />
              <Button
                onClick={handleVerification}
                disabled={isLoading || verificationCode.length !== 6}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">New York</option>
                  <option value="Europe/London">London</option>
                  {/* Add more timezone options as needed */}
                </select>
              </div>
              <Button
                onClick={handlePreferences}
                disabled={isLoading}
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
