-- Create benchmark_items table
CREATE TABLE IF NOT EXISTS benchmark_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    specs_description TEXT,
    base_srp NUMERIC,
    platform_average NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price_proposals table
CREATE TABLE IF NOT EXISTS price_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id TEXT NOT NULL REFERENCES profiles(id),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    specs_description TEXT,
    proposed_price NUMERIC NOT NULL,
    proof_link TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security)
ALTER TABLE benchmark_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_proposals ENABLE ROW LEVEL SECURITY;

-- Everyone can read benchmark items
CREATE POLICY "Enable read access for all users on benchmark_items"
ON benchmark_items FOR SELECT
USING (true);

-- Only authenticated users can read proposals (Admin check usually done in backend or app logic, but let's allow read for now)
CREATE POLICY "Enable read access for all on price_proposals"
ON price_proposals FOR SELECT
USING (true);

-- Anyone can insert proposals (the backend API will handle this)
CREATE POLICY "Enable insert access for all on price_proposals"
ON price_proposals FOR INSERT
WITH CHECK (true);

-- We'll allow updates to price_proposals via service role in the backend, 
-- but let's allow all for now to avoid RLS issues during MVP
CREATE POLICY "Enable update access for all on price_proposals"
ON price_proposals FOR UPDATE
USING (true)
WITH CHECK (true);

-- Same for benchmark items (allow all for MVP)
CREATE POLICY "Enable update access for all on benchmark_items"
ON benchmark_items FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable insert access for all on benchmark_items"
ON benchmark_items FOR INSERT
WITH CHECK (true);

-- Seed some initial data for everyday items (DTI Official Reference)
INSERT INTO benchmark_items (name, category, base_srp, platform_average) VALUES
('A4 Bond Paper (Ream)', 'Office Supplies', 180.00, 175.50),
('Ballpen (Box of 50)', 'Office Supplies', 250.00, 240.00),
('Face Mask (Box of 50)', 'Medical Supplies', 55.00, 50.00),
('Monoblock Chair', 'Furniture', 350.00, 320.00);

-- Seed one dynamic item for IT Equipment (no base_srp, but has platform_average)
INSERT INTO benchmark_items (name, category, specs_description, platform_average) VALUES
('Laptop (Mid-Range)', 'IT Equipment', 'Intel i5 / Ryzen 5, 8GB RAM, 512GB SSD', 45000.00);
