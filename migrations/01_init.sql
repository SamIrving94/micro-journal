-- Create a simple users table with just phone numbers
CREATE TABLE IF NOT EXISTS users (
    phone_number TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a simple journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT REFERENCES users(phone_number) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create simple indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_phone_number ON journal_entries(phone_number);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);

-- Drop any existing RLS policies
DROP POLICY IF EXISTS "Users can view own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can create own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON journal_entries;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that allow all operations
CREATE POLICY "Allow all operations on users"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on journal entries"
    ON journal_entries FOR ALL
    USING (true)
    WITH CHECK (true); 