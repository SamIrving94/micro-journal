-- Enable auth schema for Supabase Auth
CREATE SCHEMA IF NOT EXISTS auth;

-- Update users table to work with Supabase Auth
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_phone_number_key,
DROP COLUMN IF EXISTS phone_number,
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update journal_entries table to use user_id instead of phone_number
ALTER TABLE public.journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_phone_number_fkey,
DROP COLUMN IF EXISTS phone_number,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);

-- Update RLS policies for users
DROP POLICY IF EXISTS "Users can manage own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated access
CREATE POLICY "Users can view and update own profile"
ON public.users FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own journal entries"
ON public.journal_entries FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 