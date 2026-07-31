-- Add subcategory to benchmark_items
ALTER TABLE benchmark_items 
ADD COLUMN subcategory VARCHAR(100);

-- Add subcategory to price_proposals
ALTER TABLE price_proposals 
ADD COLUMN subcategory VARCHAR(100);

-- Update seed data to have subcategories
UPDATE benchmark_items SET subcategory = 'Paper Products' WHERE name = 'A4 Bond Paper (Ream)' AND category = 'Office Supplies';
UPDATE benchmark_items SET subcategory = 'Writing Tools' WHERE name = 'Ballpen (Box of 50)' AND category = 'Office Supplies';
UPDATE benchmark_items SET subcategory = 'Face Masks' WHERE name = 'Face Mask (Box of 50)' AND category = 'Medical Supplies';
UPDATE benchmark_items SET subcategory = 'Seating' WHERE name = 'Monoblock Chair' AND category = 'Furniture';
UPDATE benchmark_items SET subcategory = 'Laptop' WHERE name = 'Laptop (Mid-Range)' AND category = 'IT Equipment';
