-- Create a table to map phone numbers to user IDs
CREATE TABLE IF NOT EXISTS phone_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_phone_mappings_phone_number ON phone_mappings(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_mappings_user_id ON phone_mappings(user_id);

-- Enable Row Level Security
ALTER TABLE phone_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to manage their own phone mappings
CREATE POLICY "Users can manage own phone mappings"
ON phone_mappings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 