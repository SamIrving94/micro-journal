-- Add source column to existing journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN source TEXT DEFAULT 'web' CHECK (source IN ('web', 'whatsapp', 'api'));

-- Add comment for the new column
COMMENT ON COLUMN public.journal_entries.source IS 'The source of the journal entry (web, whatsapp, or api)'; 