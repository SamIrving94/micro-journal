import { NextResponse } from 'next/server';
import { signIn, resetPassword, updatePassword } from '@/lib/supabase/client';
import { signUp } from '@/api/auth';

// Define a type for possible errors
interface AuthError {
  message?: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user in auth system
    const { data, error } = await signUp(email, password);
    
    if (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Sign up failed';
        
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'User created successfully', user: data?.user || null },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call signIn without arguments (it now returns a warning and null data)
    const { data, error } = await signIn();
    
    if (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Sign in failed';
        
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Since we're using Clerk now, we won't have user data from Supabase
    return NextResponse.json(
      { 
        message: 'Note: Authentication is now handled by Clerk. Please use Clerk authentication endpoints instead.',
        redirectTo: '/api/clerk/auth'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error signing in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Call resetPassword without arguments (it now returns a warning and null error)
    const { error } = await resetPassword();
    
    if (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Failed to send password reset email';
        
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Note: Password reset is now handled by Clerk. Please use Clerk authentication endpoints instead.',
        redirectTo: '/api/clerk/forgot-password'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 