import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  updatePassword,
  getUserByEmail,
  createUser
} from '../lib/supabase';
import { emailSchema, passwordSchema, signinSchema, signupSchema, resetPasswordSchema } from '../schemas/auth';

/**
 * Sign in a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  try {
    // Validate input
    const result = signinSchema.safeParse({ email, password });
    
    if (!result.success) {
      return { data: null, error: result.error.format() };
    }

    // Proceed with authentication
    return await signIn(email, password);
  } catch (error) {
    console.error('Authentication error:', error);
    return { data: null, error: { message: 'An unexpected error occurred during authentication' } };
  }
}

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string) {
  try {
    // Validate input
    const result = signupSchema.safeParse({ email, password, confirmPassword: password });
    
    if (!result.success) {
      return { data: null, error: result.error.format() };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { data: null, error: { message: 'User with this email already exists' } };
    }

    // Create user in auth system
    const signUpResult = await signUp(email, password);
    if (signUpResult.error) {
      return signUpResult;
    }

    // Create user in database
    await createUser(email);
    
    return signUpResult;
  } catch (error) {
    console.error('Registration error:', error);
    return { data: null, error: { message: 'An unexpected error occurred during registration' } };
  }
}

/**
 * Log out the current user
 */
export async function logoutUser() {
  try {
    return await signOut();
  } catch (error) {
    console.error('Logout error:', error);
    return { error: { message: 'An unexpected error occurred during logout' } };
  }
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(email: string) {
  try {
    // Validate email
    const result = emailSchema.safeParse(email);
    
    if (!result.success) {
      return { data: null, error: result.error.format() };
    }

    return await resetPassword(email);
  } catch (error) {
    console.error('Password reset request error:', error);
    return { data: null, error: { message: 'An unexpected error occurred during password reset request' } };
  }
}

/**
 * Update user password
 */
export async function changePassword(password: string, confirmPassword: string) {
  try {
    // Validate passwords
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    
    if (!result.success) {
      return { data: null, error: result.error.format() };
    }

    return await updatePassword(password);
  } catch (error) {
    console.error('Password update error:', error);
    return { data: null, error: { message: 'An unexpected error occurred during password update' } };
  }
} 