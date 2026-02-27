-- Add last_free_claim_date column to profiles table
ALTER TABLE profiles 
ADD COLUMN last_free_claim_date timestamp with time zone;

-- Optional: Add a comment to explain the column
COMMENT ON COLUMN profiles.last_free_claim_date IS 'Timestamp of the last time the user claimed the quarterly free gift';
