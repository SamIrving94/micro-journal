-- Create verification_codes table for WhatsApp verification
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id_phone ON verification_codes(user_id, phone_number);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can only access their own verification codes"
  ON verification_codes
  FOR ALL
  USING (user_id = auth.uid());

-- Add function to automatically clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM verification_codes 
  WHERE expires_at < NOW() OR used = TRUE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to run cleanup function
CREATE TRIGGER cleanup_expired_codes
AFTER INSERT ON verification_codes
EXECUTE FUNCTION cleanup_expired_verification_codes(); 