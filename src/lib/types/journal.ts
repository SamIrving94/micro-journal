export interface JournalEntry {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface JournalEntryInput {
  content: string
  user_id: string
}

export interface JournalEntryUpdate {
  content?: string
  updated_at?: string
}

export interface JournalEntryResponse {
  data: JournalEntry | null
  error: Error | null
}

export interface JournalEntriesResponse {
  data: JournalEntry[] | null
  error: Error | null
} 