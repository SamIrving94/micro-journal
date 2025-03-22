'use client';

import { useState, useEffect } from 'react';
import { Mail, Key, AlertTriangle, Save, Trash, RefreshCw } from 'lucide-react';
import { getSession } from '@/lib/supabase';
import { Button } from '@/app/components/ui/atoms/Button';
import { Input } from '@/app/components/ui/atoms/Input';
import { JournalLayout } from '@/app/components/layouts/JournalLayout';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
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
        setEmail(session.user.email || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');
    
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This is a placeholder - implement the actual password change logic
      // using Supabase's auth.updateUser() method
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDataExport = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // This is a placeholder - implement actual data export logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Data export request received. You will receive an email with your data.');
    } catch (err) {
      console.error('Error requesting data export:', err);
      setError(err instanceof Error ? err.message : 'Failed to request data export');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JournalLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Management</h1>
        
        {error && (
          <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-6 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}
        
        {/* Email Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Address</h2>
          
          <div className="flex items-center p-4 bg-clay-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-gray-700">{email}</span>
          </div>
          
          <p className="mt-3 text-sm text-gray-500">
            Your email address is used for account recovery and notifications.
          </p>
        </div>
        
        {/* Password Change */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>
            
            <Button
              onClick={handleUpdatePassword}
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              loading={isLoading}
              variant="primary"
              size="md"
            >
              <Key className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <Button
              onClick={handleRequestDataExport}
              disabled={isLoading}
              loading={isLoading}
              variant="secondary"
              size="md"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Request Data Export
            </Button>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
                    <p className="mt-1 text-sm text-red-700">
                      Deleting your account will permanently remove all of your data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="md"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </JournalLayout>
  );
} 