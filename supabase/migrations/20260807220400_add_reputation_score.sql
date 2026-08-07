-- Migration: Add reputation_score to profiles

ALTER TABLE profiles
ADD COLUMN reputation_score INTEGER DEFAULT 0;

-- Set base score of 50 for already verified users
UPDATE profiles
SET reputation_score = 50
WHERE verification_status = 'verified';
