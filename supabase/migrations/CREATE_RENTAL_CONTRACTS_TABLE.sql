-- Create rental_contracts table
CREATE TABLE IF NOT EXISTS rental_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number TEXT NOT NULL UNIQUE,
  contract_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Customer information
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_document TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_state TEXT,
  customer_phone TEXT,
  customer_reference TEXT,
  
  -- Rental period
  rental_period TEXT NOT NULL CHECK (rental_period IN ('day', 'week', 'month')),
  rental_duration INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Items (stored as JSONB array)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Financial values
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  assembly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Payment information
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card', 'cash')),
  pix_key TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on contract_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_rental_contracts_contract_number ON rental_contracts(contract_number);

-- Create index on customer_id for faster customer lookups
CREATE INDEX IF NOT EXISTS idx_rental_contracts_customer_id ON rental_contracts(customer_id);

-- Create index on contract_date for sorting
CREATE INDEX IF NOT EXISTS idx_rental_contracts_contract_date ON rental_contracts(contract_date DESC);

-- Enable Row Level Security
ALTER TABLE rental_contracts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON rental_contracts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rental_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rental_contracts_updated_at
  BEFORE UPDATE ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_contracts_updated_at();
