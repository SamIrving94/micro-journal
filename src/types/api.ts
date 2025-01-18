export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface UserPreferences {
  promptTime: string;
  timezone: string;
  promptCategories: string[];
  notificationPreferences: {
    platform: 'whatsapp';
    reminders: boolean;
    weeklyDigest: boolean;
  };
} 