'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, Calendar as CalendarIcon, LogOut, Settings, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/client'
import { Calendar } from '@/components/ui/Calendar'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'

interface JournalLayoutProps {
  children: React.ReactNode
}

export function JournalLayout({ children }: JournalLayoutProps) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [journalStats, setJournalStats] = useState({
    entries: 0,
    wordsWritten: 0,
  })
  const router = useRouter()

  // Calculate stats for the selected date
  useEffect(() => {
    if (selectedDate) {
      // This would be implemented with a real API call to get stats
      // For now, we'll just use dummy data
      setJournalStats({
        entries: Math.floor(Math.random() * 3),
        wordsWritten: Math.floor(Math.random() * 500),
      })
    }
  }, [selectedDate])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.replace('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    // In a real implementation, this would trigger a query to load entries for the selected date
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-medium text-gray-900">MicroJournal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => router.push('/settings')}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto mt-8 px-4 pb-20 relative">
        {children}
      </main>

      {/* Toggle Button (visible when panel is hidden) */}
      {!isSidePanelOpen && (
        <button
          onClick={() => setIsSidePanelOpen(true)}
          className="fixed right-0 top-24 z-40 bg-white p-2 rounded-l-lg shadow-md border border-r-0 border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Show calendar"
        >
          <CalendarIcon className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Side Panel */}
      <aside
        className={cn(
          "w-80 bg-white border-l border-gray-200 shadow-md transform transition-transform duration-300 fixed right-0 top-16 bottom-0 z-50",
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
          
          {/* Calendar Component */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md"
              initialFocus
            />
          </div>
          
          {/* Stats or additional info */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {selectedDate ? (
                  <>
                    Stats for {selectedDate.toLocaleDateString()}
                  </>
                ) : "Today's Stats"}
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex justify-between">
                  <span>Entries:</span>
                  <span className="font-medium">{journalStats.entries}</span>
                </p>
                <p className="flex justify-between">
                  <span>Words written:</span>
                  <span className="font-medium">{journalStats.wordsWritten}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
} 