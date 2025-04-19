export interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  phone_number: string;
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
  phone_number: string;
} 