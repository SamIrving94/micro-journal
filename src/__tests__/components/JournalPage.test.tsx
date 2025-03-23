import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JournalPage from '@/app/journal/page';
import * as supabaseUtils from '@/lib/supabase';

// Mock the supabase utility functions
jest.mock('@/lib/supabase', () => ({
  getJournalEntries: jest.fn(),
  createJournalEntry: jest.fn(),
  deleteJournalEntry: jest.fn(),
  getSession: jest.fn(),
}));

describe('Journal Page', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (supabaseUtils.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    });
    
    (supabaseUtils.getJournalEntries as jest.Mock).mockResolvedValue([
      { id: '1', content: 'Test journal entry 1', created_at: new Date().toISOString() },
      { id: '2', content: 'Test journal entry 2', created_at: new Date().toISOString() }
    ]);
    
    (supabaseUtils.createJournalEntry as jest.Mock).mockResolvedValue({
      id: '3',
      content: 'New journal entry',
      created_at: new Date().toISOString()
    });
    
    (supabaseUtils.deleteJournalEntry as jest.Mock).mockResolvedValue(true);
  });

  it('renders the journal page with entries', async () => {
    render(<JournalPage />);
    
    // Wait for the entries to load
    await waitFor(() => {
      expect(screen.getByText('Test journal entry 1')).toBeInTheDocument();
      expect(screen.getByText('Test journal entry 2')).toBeInTheDocument();
    });
    
    // Check that the text area for new entries is rendered
    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
  });

  it('allows users to create a new journal entry', async () => {
    render(<JournalPage />);
    
    // Type in the text area
    const textArea = screen.getByPlaceholderText(/what's on your mind/i);
    fireEvent.change(textArea, { target: { value: 'New journal entry' } });
    
    // Click the save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Check that createJournalEntry was called with the right content
    await waitFor(() => {
      expect(supabaseUtils.createJournalEntry).toHaveBeenCalledWith(
        expect.any(String),
        'New journal entry'
      );
    });
  });

  it('allows users to delete a journal entry', async () => {
    render(<JournalPage />);
    
    // Wait for the entries to load
    await waitFor(() => {
      expect(screen.getByText('Test journal entry 1')).toBeInTheDocument();
    });
    
    // Find and click the delete button for the first entry
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check that deleteJournalEntry was called with the right id
    await waitFor(() => {
      expect(supabaseUtils.deleteJournalEntry).toHaveBeenCalledWith('1');
    });
  });
}); 