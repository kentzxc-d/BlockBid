-- Add missing columns for awarded projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS awarded_supplier_id text references profiles(id),
ADD COLUMN IF NOT EXISTS awarded_at timestamp with time zone;
