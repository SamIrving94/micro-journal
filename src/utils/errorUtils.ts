/**
 * Standard error response format
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * Error types for better error handling
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  DATABASE = 'DATABASE_ERROR',
  SUPABASE = 'SUPABASE_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
}

/**
 * Creates a formatted error object
 * @param message Error message
 * @param type Error type
 * @param details Additional error details
 * @returns Formatted error object
 */
export function createError(
  message: string,
  type: ErrorType = ErrorType.SERVER,
  details?: Record<string, any>
): ApiError {
  return {
    message,
    code: type,
    details,
  };
}

/**
 * Processes a caught error into a standardized format
 * @param error The caught error
 * @returns Formatted error object
 */
export function handleError(error: unknown): ApiError {
  console.error('Error occurred:', error);
  
  // Handle specific error types
  if (error instanceof Error) {
    // Handle specific Supabase errors
    if (error.message.includes('auth/')) {
      return createError(error.message, ErrorType.AUTHENTICATION);
    }
    
    return createError(error.message);
  }
  
  // Default error handling
  return createError('An unexpected error occurred');
}

/**
 * Creates a standardized API response
 * @param data Response data
 * @param error Error object
 * @returns Formatted API response
 */
export function createResponse<T>(data: T | null, error: ApiError | null = null): ApiResponse<T> {
  return { data, error };
}

/**
 * Handles try/catch blocks with a consistent pattern
 * @param fn Async function to execute
 * @returns Promise with standardized response
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return createResponse(data);
  } catch (error) {
    return createResponse<T>(null, handleError(error));
  }
} 