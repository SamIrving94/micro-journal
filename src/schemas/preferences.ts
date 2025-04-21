import { z } from 'zod';

// User preferences schema
export const preferencesSchema = z.object({
  notifications_enabled: z.boolean().default(true),
  prompt_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in 24h format (HH:MM)').default('09:00'),
  timezone: z.string().default('UTC'),
  prompt_categories: z.array(z.string()).default(['gratitude', 'reflection', 'learning']),
  whatsapp_verified: z.boolean().default(false),
  phone_number: z.string().nullable().optional(),
});

// WhatsApp verification schema
export const whatsappVerificationSchema = z.object({
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  verification_code: z.string().length(6, 'Verification code must be 6 digits').optional(),
});

// Types derived from schemas
export type UserPreferences = z.infer<typeof preferencesSchema>;
export type WhatsappVerification = z.infer<typeof whatsappVerificationSchema>; 