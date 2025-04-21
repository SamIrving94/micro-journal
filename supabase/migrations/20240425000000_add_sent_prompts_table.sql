-- Create sent_prompts table to track prompts sent to users
CREATE TABLE IF NOT EXISTS sent_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  message_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  response_text TEXT,
  response_at TIMESTAMPTZ
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sent_prompts_user_id ON sent_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_prompts_message_id ON sent_prompts(message_id);

-- Enable RLS
ALTER TABLE sent_prompts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can only access their own sent prompts"
  ON sent_prompts
  FOR SELECT
  USING (user_id = auth.uid());

-- Only service role can insert/update sent prompts
CREATE POLICY "Service role can manage sent prompts"
  ON sent_prompts
  USING (
    (SELECT is_service_role() FROM auth.jwt())
  ); 