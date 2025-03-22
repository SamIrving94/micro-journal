'use client';

import { useState, useEffect } from 'react';
import { Phone, Save, Check } from 'lucide-react';
import { getSession } from '@/lib/supabase';
import { associatePhoneWithUser, getPhoneMappingForUser } from '@/lib/user-mapping';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';
import { JournalLayout } from '@/app/components/layouts/JournalLayout';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          router.replace('/auth/signin');
          return;
        }
        setUserId(session.user.id);
        
        // Get existing phone number if available
        setIsLoadingPhone(true);
        const existingPhone = await getPhoneMappingForUser(session.user.id);
        if (existingPhone) {
          setPhoneNumber(existingPhone);
        }
        setIsLoadingPhone(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoadingPhone(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleSavePhone = async () => {
    if (!userId) {
      setError('Please sign in to save settings');
      return;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setIsSaved(false);
    
    try {
      // Format the phone number (add + if not present)
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      
      const success = await associatePhoneWithUser(formattedPhone, userId);
      
      if (success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        throw new Error('Failed to save phone number');
      }
    } catch (err) {
      console.error('Error saving phone number:', err);
      setError(err instanceof Error ? err.message : 'Failed to save phone number');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <JournalLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
        
        {error && (
          <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {isSaved && (
          <div className="p-3 mb-6 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            Settings saved successfully
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Integration</h2>
          <p className="text-gray-600 mb-4">
            Connect your WhatsApp number to journal by sending messages or voice notes.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Phone Number
              </label>
              <div className="relative">
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
              <p className="mt-1 text-sm text-gray-500">
                Include your country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>
            
            <Button
              onClick={handleSavePhone}
              disabled={isLoading || !phoneNumber}
              loading={isLoading}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Number
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-clay-50 rounded-lg border border-clay-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How to use:</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-5">
              <li>Save your WhatsApp number above</li>
              <li>Send a message to <span className="font-medium">+1-415-523-8886</span></li>
              <li>Send text messages or voice notes to journal</li>
              <li>Your entries will appear in your journal automatically</li>
            </ol>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice Notes</h2>
          <p className="text-gray-600 mb-4">
            You can now send voice notes via WhatsApp for automatic transcription to your journal.
          </p>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="text-sm font-medium text-orange-800 mb-2">Tips for best results:</h3>
            <ul className="text-sm text-orange-700 space-y-2 list-disc pl-5">
              <li>Speak clearly and at a moderate pace</li>
              <li>Find a quiet environment with minimal background noise</li>
              <li>Keep voice notes under 2 minutes for best accuracy</li>
              <li>Review transcribed entries and edit if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </JournalLayout>
  );
} 