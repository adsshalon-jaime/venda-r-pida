-- Add sale_date and is_rental columns to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_date DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_rental BOOLEAN DEFAULT FALSE;

-- Add comments to the columns
COMMENT ON COLUMN sales.sale_date IS 'Date when the sale/rental occurred';
COMMENT ON COLUMN sales.is_rental IS 'Indicates if this is a rental transaction';

-- Update existing records to set is_rental = false and sale_date = created_at
UPDATE sales SET 
  is_rental = false,
  sale_date = created_at 
WHERE is_rental IS NULL OR sale_date IS NULL;

-- Create index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_is_rental ON sales(is_rental);
