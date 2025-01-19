// In src/types/api.ts
export interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tags?: string[];
}
