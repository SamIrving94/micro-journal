-- Create prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add phone number and preferences to users table
ALTER TABLE users
ADD COLUMN phone_number TEXT UNIQUE,
ADD COLUMN preferences JSONB DEFAULT '{
  "notifications_enabled": true,
  "prompt_time": "09:00",
  "timezone": "UTC"
}'::jsonb;

-- Create index for active prompts
CREATE INDEX idx_prompts_active ON prompts(is_active);

-- Enable RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for all users" ON prompts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON prompts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON prompts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert some sample prompts
INSERT INTO prompts (content, category) VALUES
  ('What are you grateful for today?', 'gratitude'),
  ('What was the highlight of your day?', 'reflection'),
  ('What did you learn today?', 'learning'),
  ('How are you feeling right now?', 'emotions'),
  ('What are you looking forward to tomorrow?', 'future'); 