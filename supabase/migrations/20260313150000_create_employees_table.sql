-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  address JSONB NOT NULL,
  phone TEXT NOT NULL,
  backup_phone TEXT,
  entry_date TEXT NOT NULL,
  exit_date TEXT,
  work_hours TEXT NOT NULL,
  lunch_break TEXT NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  work_schedule TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_cpf ON employees(cpf);
CREATE INDEX idx_employees_phone ON employees(phone);

-- Add RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage employees
CREATE POLICY "Users can manage employees" ON employees
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
