'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { resetPassword, updatePassword } from '@/lib/supabase';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if we have a token in the URL (from the password reset email)
  const token = searchParams.get('token');
  const resetMode = !!token;

  const handleRequestReset = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Request password reset
      await resetPassword(email);
      setSuccess('Check your email for a password reset link');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
      console.error('Error requesting password reset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!password || !confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Update password using the token from URL
      await updatePassword(password);
      setSuccess('Password updated successfully! You can now sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      console.error('Error updating password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {resetMode ? 'Create New Password' : 'Reset Your Password'}
            </h1>
            <p className="text-gray-700 text-base">
              {resetMode 
                ? 'Enter a new password for your account' 
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>
          <div className="space-y-4">
            {/* Request reset form */}
            {!resetMode && (
              <>
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
                <Button
                  onClick={handleRequestReset}
                  disabled={isLoading || !email}
                  loading={isLoading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </>
            )}

            {/* Update password form */}
            {resetMode && (
              <>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">New Password</label>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handleUpdatePassword}
                  disabled={isLoading || !password || !confirmPassword}
                  loading={isLoading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </>
            )}
            
            <div className="text-center">
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 