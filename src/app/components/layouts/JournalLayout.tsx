'use client';

import React, { useState } from 'react';
import { Menu, ChevronRight, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/atoms/Button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface JournalLayoutProps {
  children: React.ReactNode;
}

export function JournalLayout({ children }: JournalLayoutProps) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage or session data
      localStorage.removeItem('userPhone');
      sessionStorage.clear();
      
      router.push('/auth/signup');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-clay-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-clay-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">MicroJournal</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto mt-8 px-4 relative">
        {children}
      </main>

      {/* Toggle Button (visible when panel is hidden) */}
      {!isSidePanelOpen && (
        <button
          onClick={() => setIsSidePanelOpen(true)}
          className="fixed right-0 top-24 z-40 bg-white p-2 rounded-l-lg shadow-md border border-r-0 border-clay-200 hover:bg-clay-50 transition-colors"
          aria-label="Show calendar"
        >
          <CalendarIcon className="h-5 w-5 text-clay-600" />
        </button>
      )}

      {/* Side Panel */}
      <aside
        className={cn(
          "w-80 bg-white border-l border-clay-200 transform transition-transform duration-300 fixed right-0 top-16 bottom-0 z-50",
          isSidePanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Calendar</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidePanelOpen(false)}
              aria-label="Hide calendar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Calendar content will go here */}
        </div>
      </aside>
    </div>
  );
} 