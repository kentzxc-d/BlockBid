CREATE TABLE IF NOT EXISTS gas_sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  wallet_address text NOT NULL,
  amount_sent numeric NOT NULL,
  tx_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add some indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_gas_sponsorships_user_id ON gas_sponsorships(user_id);
CREATE INDEX IF NOT EXISTS idx_gas_sponsorships_created_at ON gas_sponsorships(created_at);
