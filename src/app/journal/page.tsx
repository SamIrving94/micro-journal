'use client'

import { useState } from 'react'
import { Calendar } from '@/ui/atoms/Calendar'
import { Button } from '@/ui/atoms/Button'
import { Input } from '@/ui/atoms/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/atoms/Tabs'
import { ScrollArea } from '@/ui/atoms/ScrollArea'
import EntryList from '@/components/EntryList'
import EntryEditor from '@/components/EntryEditor'
import { SearchEntries } from '@/components/SearchEntries'
import { selectEntryAction } from '@/app/actions/entry'

export default function JournalPage() {
  const [isNewEntry, setIsNewEntry] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-clay-200 bg-white sticky top-0 z-10">
        <SearchEntries />
        <Button onClick={() => setIsNewEntry(true)}>New Entry</Button>
      </div>

      <Tabs defaultValue="entries" className="flex-1">
        <TabsList className="px-4 border-b border-clay-200">
          <TabsTrigger value="entries">All Entries</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="flex-1 p-4">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <EntryList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calendar" className="p-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Calendar />
          </div>
        </TabsContent>
      </Tabs>

      {isNewEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">New Entry</h2>
              <div className="space-y-4">
                <textarea 
                  className="journal-input min-h-[200px] resize-none"
                  placeholder="Write your thoughts here..."
                />
                <Input 
                  placeholder="Add tags (press Enter to add)"
                  className="journal-input"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setIsNewEntry(false)}>Cancel</Button>
                <Button>Save Entry</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

