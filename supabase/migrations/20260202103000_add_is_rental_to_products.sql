-- Add is_rental column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_rental BOOLEAN DEFAULT FALSE;

-- Add comment to the column
COMMENT ON COLUMN products.is_rental IS 'Indicates if the product is available for rental';

-- Update existing products to have is_rental = false by default
UPDATE products SET is_rental = false WHERE is_rental IS NULL;
