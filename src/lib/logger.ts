/**
 * Simple logging utility
 */
interface LogLevel {
  info: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
}

// Simple console logger implementation
export const logger: LogLevel = {
  info: (message, meta) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  error: (message, meta) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
  warn: (message, meta) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  debug: (message, meta) => {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
}; 