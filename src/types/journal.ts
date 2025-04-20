export interface JournalEntry {
  id: string;
  user_id?: string;
  phone_number?: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  source?: string;
}

export interface User {
  phone_number: string;
  journal_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryQuery {
  date?: string;
  phone_number?: string;
  user_id?: string;
}

export interface JournalEntryInput {
  content: string;
  user_id?: string;
  phone_number?: string;
  source?: string;
}

export interface JournalEntryUpdate {
  content?: string;
  updated_at?: string;
  tags?: string[];
}

export interface JournalEntryResponse {
  data: JournalEntry | null;
  error: Error | null;
}

export interface JournalEntriesResponse {
  data: JournalEntry[] | null;
  error: Error | null;
} 