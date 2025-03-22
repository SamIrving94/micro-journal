// In src/types/api.ts
export interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tags: string[];
  source?: string;
}

export interface User {
  id: string;
  email: string;
  journal_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type UserPreferences = Pick<User, 'journal_time' | 'timezone'>;
