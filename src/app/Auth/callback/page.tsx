'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          // Redirect to preferences page after successful verification
          router.push('/auth/signup?step=preferences');
        } else {
          router.push('/auth/signup');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/auth/signup');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-clay-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
        <p className="text-gray-600">Please wait while we complete the verification process.</p>
      </div>
    </div>
  );
} 