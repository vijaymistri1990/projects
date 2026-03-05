-- Migration: Add name column to sm_users table
-- Run this SQL script to add the name column if it doesn't exist

-- Add name column to sm_users table
ALTER TABLE sm_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Optional: Update existing users with a default name based on username
UPDATE sm_users 
SET name = username 
WHERE name IS NULL OR name = '';
