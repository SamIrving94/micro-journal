// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock the next/navigation functions
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signInWithOtp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }),
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  getJournalEntries: jest.fn(),
  createJournalEntry: jest.fn(),
  deleteJournalEntry: jest.fn(),
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUserPreferences: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
})); 