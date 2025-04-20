import { createClient } from '../lib/supabase/client';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthResponse {
  user: User | null;
  error: Error | null;
}

interface SignUpResult {
  data: { user: any } | null;
  error: Error | null;
}

interface Error {
  message: string;
}

/**
 * Creates a new user account
 * @param email User's email
 * @param password User's password
 * @returns Promise with the created user or error
 */
export async function createUser(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return {
        user: null,
        error: { message: 'Email and password are required' }
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message }
      };
    }

    // Ensure user exists and has the expected shape
    if (!data?.user) {
      return {
        user: null,
        error: { message: 'Failed to create user account' }
      };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at || new Date().toISOString()
      },
      error: null
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    return {
      user: null,
      error: { message: 'Internal server error during user creation' }
    };
  }
}

/**
 * Signs up a new user directly using supabase auth
 * @param email User's email
 * @param password User's password
 * @returns Promise with the signup result
 */
export async function signUp(email: string, password: string): Promise<SignUpResult> {
  try {
    const supabase = createClient();
    const signUpResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/verify-email`,
      }
    });
    
    if (signUpResult.error) {
      return {
        data: null,
        error: { message: signUpResult.error.message }
      };
    }
    
    return {
      data: signUpResult.data,
      error: null
    };
  } catch (error) {
    console.error('Error in signUp:', error);
    return {
      data: null,
      error: { message: 'Internal server error during sign up' }
    };
  }
}

/**
 * Signs in an existing user
 * @param email User's email
 * @param password User's password
 * @returns Promise with the authenticated user or error
 */
export async function signInUser(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return {
        user: null,
        error: { message: 'Email and password are required' }
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message }
      };
    }

    // Add null check for data and data.user
    if (!data || !data.user) {
      return {
        user: null,
        error: { message: 'No user returned from authentication' }
      };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at || new Date().toISOString()
      },
      error: null
    };
  } catch (error) {
    console.error('Error in signInUser:', error);
    return {
      user: null,
      error: { message: 'Internal server error during sign in' }
    };
  }
}

/**
 * Signs out the current user
 * @returns Promise with success status or error
 */
export async function signOutUser(): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Error in signOutUser:', error);
    return {
      success: false,
      error: { message: 'Internal server error during sign out' }
    };
  }
}

/**
 * Resets a user's password
 * @param email User's email
 * @returns Promise with success status or error
 */
export async function resetUserPassword(email: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (!email) {
      return {
        success: false,
        error: { message: 'Email is required' }
      };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Error in resetUserPassword:', error);
    return {
      success: false,
      error: { message: 'Internal server error during password reset' }
    };
  }
} 