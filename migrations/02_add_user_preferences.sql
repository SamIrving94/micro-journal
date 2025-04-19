-- Add user preferences columns
ALTER TABLE public.users
ADD COLUMN journal_time time DEFAULT '20:00',
ADD COLUMN timezone text DEFAULT 'UTC';

-- Update RLS policies
DROP POLICY IF EXISTS "Enable all operations for users" ON public.users;

CREATE POLICY "Users can view and update their own data" ON public.users
    FOR ALL
    USING (true)  -- For now, allow all operations. We'll refine this later with proper auth
    WITH CHECK (true);

-- Add comment to explain the columns
COMMENT ON COLUMN public.users.journal_time IS 'The time of day when the user wants to receive journal prompts';
COMMENT ON COLUMN public.users.timezone IS 'The user''s timezone for scheduling journal prompts'; 