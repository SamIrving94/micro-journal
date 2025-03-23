import { 
  signIn,
  signOut,
  getSession,
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  createUser,
  getUserByEmail,
  updateUserPreferences,
  resetPassword,
  updatePassword
} from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    auth: {
      signInWithOtp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  
  return {
    createClient: jest.fn(() => mockSupabase),
  };
});

describe('Supabase Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('calls signInWithOtp with the correct email and password', async () => {
      const mockSignInWithOtp = require('@supabase/supabase-js').createClient().auth.signInWithOtp;
      mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });

      await signIn('test@example.com', 'password123');
      
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { emailRedirectTo: expect.any(String) }
      });
    });
  });

  describe('signOut', () => {
    it('calls signOut method', async () => {
      const mockSignOut = require('@supabase/supabase-js').createClient().auth.signOut;
      mockSignOut.mockResolvedValue({ error: null });

      await signOut();
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('returns the user session when available', async () => {
      const mockGetSession = require('@supabase/supabase-js').createClient().auth.getSession;
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user', email: 'test@example.com' }
          }
        },
        error: null
      });

      const session = await getSession();
      
      expect(session).toEqual({
        user: { id: 'test-user', email: 'test@example.com' }
      });
    });

    it('returns null when no session is available', async () => {
      const mockGetSession = require('@supabase/supabase-js').createClient().auth.getSession;
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const session = await getSession();
      
      expect(session).toBeNull();
    });
  });

  // Additional tests for other functions would follow the same pattern
}); 