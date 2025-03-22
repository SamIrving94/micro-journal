'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { signIn } from '@/lib/supabase';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';

export default function SignInPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Sign in with email and password
      const { session } = await signIn(email, password);
      
      if (session) {
        router.push('/journal');
      } else {
        throw new Error('Failed to sign in. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      console.error('Error signing in:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Error/Success message */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-700 text-base">Sign in to your journal</p>
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
                placeholder="Enter your password"
              />
            </div>
            <Button
              onClick={handleSignIn}
              disabled={isLoading || !email || !password}
              loading={isLoading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign Up
                </button>
              </p>
              <p className="text-sm text-gray-500">
                <button
                  onClick={() => router.push('/auth/reset-password')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Forgot your password?
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 