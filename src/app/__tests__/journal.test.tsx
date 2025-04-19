import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JournalPage from '../journal/page';
import { getUser } from '@/lib/supabase/client';
import { getJournalEntries, createJournalEntry } from '@/lib/services/journal';

// Mock the journal services
jest.mock('@/lib/services/journal', () => ({
  getJournalEntries: jest.fn(),
  createJournalEntry: jest.fn(),
}));

// Mock the getUser function
jest.mock('@/lib/supabase/client', () => ({
  getUser: jest.fn(),
}));

describe('JournalPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (getUser as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
      error: null,
    });
    
    (getJournalEntries as jest.Mock).mockResolvedValue({
      data: [
        {
          id: '1',
          user_id: 'test-user-id',
          content: 'Test journal entry',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ],
      error: null,
    });
    
    (createJournalEntry as jest.Mock).mockResolvedValue({
      data: {
        id: '2',
        user_id: 'test-user-id',
        content: 'New journal entry',
        created_at: '2023-01-02T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z',
      },
      error: null,
    });
  });
  
  it('renders the journal page with form and entries', async () => {
    render(<JournalPage />);
    
    // Check for form heading
    expect(screen.getByText('New Journal Entry')).toBeInTheDocument();
    
    // Check for entries heading to be loaded
    await waitFor(() => {
      expect(screen.getByText('Recent Entries')).toBeInTheDocument();
    });
    
    // Check that entries are loaded
    await waitFor(() => {
      expect(screen.getByText('Test journal entry')).toBeInTheDocument();
    });
  });
  
  it('allows users to create a new entry', async () => {
    render(<JournalPage />);
    
    // Type in the textarea
    const textarea = screen.getByPlaceholderText('Write your thoughts here...');
    fireEvent.change(textarea, { target: { value: 'New journal entry' } });
    
    // Submit the form
    const submitButton = screen.getByText('Save Entry');
    fireEvent.click(submitButton);
    
    // Check that createJournalEntry was called with correct parameters
    await waitFor(() => {
      expect(createJournalEntry).toHaveBeenCalledWith({
        content: 'New journal entry',
        user_id: 'test-user-id',
      });
    });
    
    // Check that getJournalEntries was called to refresh the list
    await waitFor(() => {
      expect(getJournalEntries).toHaveBeenCalledTimes(2); // Once on load, once after submit
    });
  });
  
  it('handles errors when loading entries', async () => {
    // Mock an error when loading entries
    (getJournalEntries as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Failed to load journal entries'),
    });
    
    render(<JournalPage />);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load journal entries')).toBeInTheDocument();
    });
  });
  
  it('handles errors when creating an entry', async () => {
    // Mock an error when creating an entry
    (createJournalEntry as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Failed to save journal entry'),
    });
    
    render(<JournalPage />);
    
    // Type in the textarea
    const textarea = screen.getByPlaceholderText('Write your thoughts here...');
    fireEvent.change(textarea, { target: { value: 'New journal entry' } });
    
    // Submit the form
    const submitButton = screen.getByText('Save Entry');
    fireEvent.click(submitButton);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to save journal entry')).toBeInTheDocument();
    });
  });
}); 