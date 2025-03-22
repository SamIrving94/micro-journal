-- Drop existing constraints and columns
ALTER TABLE public.users
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS encrypted_password,
DROP COLUMN IF EXISTS is_verified,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS metadata,
DROP COLUMN IF EXISTS subscription_tier;

-- Modify phone_number to be the primary identifier
ALTER TABLE public.users
ALTER COLUMN phone_number SET NOT NULL,
ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);

-- Add basic timestamps
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add journal preferences
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS journal_time TIME DEFAULT '20:00',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Update or create RLS policies
DROP POLICY IF EXISTS "Users can view and update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable all operations for users" ON public.users;

CREATE POLICY "Users can view and update by phone number"
ON public.users FOR ALL
USING (true)
WITH CHECK (true);

-- Update journal_entries foreign key to use phone_number instead of user_id
ALTER TABLE public.journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD CONSTRAINT journal_entries_phone_number_fkey 
  FOREIGN KEY (phone_number) 
  REFERENCES users(phone_number) 
  ON DELETE CASCADE;

-- Update journal entries RLS policy
DROP POLICY IF EXISTS "Users can view own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.journal_entries;

CREATE POLICY "Users can manage own entries"
ON public.journal_entries FOR ALL
USING (true)
WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE public.users IS 'User accounts identified by phone number';
COMMENT ON COLUMN public.users.phone_number IS 'Primary identifier - WhatsApp phone number';
COMMENT ON COLUMN public.users.journal_time IS 'Preferred time to receive journal prompts';
COMMENT ON COLUMN public.users.timezone IS 'User timezone for prompt scheduling'; 