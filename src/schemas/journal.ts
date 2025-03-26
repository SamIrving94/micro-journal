import { z } from 'zod';

// Journal entry validation
export const journalEntrySchema = z.object({
  content: z.string()
    .min(1, 'Journal entry cannot be empty')
    .max(2000, 'Journal entry is too long (max 2000 characters)'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  userId: z.string().uuid('Invalid user ID'),
});

// Journal entry response from database
export const journalEntryResponseSchema = journalEntrySchema.extend({
  id: z.string().uuid('Invalid entry ID'),
  created_at: z.string().datetime(),
});

// Query params for fetching journal entries
export const journalEntryQuerySchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  userId: z.string().uuid('Invalid user ID'),
}); 