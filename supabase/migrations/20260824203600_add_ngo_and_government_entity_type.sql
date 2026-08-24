-- Drop the existing constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_entity_type_check;

-- Add the new constraint with 'ngo' and 'government'
ALTER TABLE profiles
ADD CONSTRAINT profiles_entity_type_check 
CHECK (entity_type IN ('individual', 'company', 'government', 'ngo'));
