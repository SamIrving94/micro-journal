import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPage from '../settings/page';
import { getUser } from '@/lib/supabase/client';
import { getUserSettings, updateUserSettings } from '@/lib/services/settings';

// Mock the settings services
jest.mock('@/lib/services/settings', () => ({
  getUserSettings: jest.fn(),
  updateUserSettings: jest.fn(),
}));

// Mock the getUser function
jest.mock('@/lib/supabase/client', () => ({
  getUser: jest.fn(),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (getUser as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
      error: null,
    });
    
    (getUserSettings as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        user_id: 'test-user-id',
        phone_number: '+1234567890',
        notification_preferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      error: null,
    });
    
    (updateUserSettings as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        user_id: 'test-user-id',
        phone_number: '+1234567890',
        notification_preferences: {
          email: true,
          sms: true,
          whatsapp: true,
        },
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z',
      },
      error: null,
    });
  });
  
  it('renders the settings page with user preferences', async () => {
    render(<SettingsPage />);
    
    // Check for page heading
    await waitFor(() => {
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });
    
    // Check that phone number is loaded
    await waitFor(() => {
      const phoneInput = screen.getByPlaceholderText('+1234567890') as HTMLInputElement;
      expect(phoneInput.value).toBe('+1234567890');
    });
    
    // Check that notification preferences are loaded
    await waitFor(() => {
      const emailCheckbox = screen.getByLabelText(/Email Notifications/i) as HTMLInputElement;
      expect(emailCheckbox.checked).toBe(true);
      
      const smsCheckbox = screen.getByLabelText(/SMS Notifications/i) as HTMLInputElement;
      expect(smsCheckbox.checked).toBe(false);
      
      const whatsappCheckbox = screen.getByLabelText(/WhatsApp Notifications/i) as HTMLInputElement;
      expect(whatsappCheckbox.checked).toBe(false);
    });
  });
  
  it('allows users to update their settings', async () => {
    render(<SettingsPage />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });
    
    // Update notification preferences
    const smsCheckbox = screen.getByLabelText(/SMS Notifications/i) as HTMLInputElement;
    fireEvent.click(smsCheckbox);
    
    const whatsappCheckbox = screen.getByLabelText(/WhatsApp Notifications/i) as HTMLInputElement;
    fireEvent.click(whatsappCheckbox);
    
    // Save settings
    const saveButton = screen.getByText(/Save Settings/i);
    fireEvent.click(saveButton);
    
    // Check that updateUserSettings was called with correct parameters
    await waitFor(() => {
      expect(updateUserSettings).toHaveBeenCalledWith('test-user-id', {
        phone_number: '+1234567890',
        notification_preferences: {
          email: true,
          sms: true,
          whatsapp: true,
        },
      });
    });
    
    // Check that success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
    });
  });
  
  it('handles errors when loading settings', async () => {
    // Mock an error when loading settings
    (getUserSettings as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Failed to load settings'),
    });
    
    render(<SettingsPage />);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
    });
  });
  
  it('handles errors when saving settings', async () => {
    // Mock an error when updating settings
    (updateUserSettings as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Failed to save settings'),
    });
    
    render(<SettingsPage />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });
    
    // Save settings
    const saveButton = screen.getByText(/Save Settings/i);
    fireEvent.click(saveButton);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
    });
  });
}); 