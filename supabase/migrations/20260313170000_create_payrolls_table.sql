-- Create payrolls table
CREATE TABLE IF NOT EXISTS payrolls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reference_month TEXT NOT NULL,
  reference_year INTEGER NOT NULL,
  gross_salary DECIMAL(10,2) NOT NULL,
  deductions JSONB NOT NULL,
  additions JSONB NOT NULL,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_date TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  employer_document TEXT NOT NULL,
  employer_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster searches
CREATE INDEX idx_payrolls_employee_id ON payrolls(employee_id);
CREATE INDEX idx_payrolls_reference_date ON payrolls(reference_year, reference_month);
CREATE INDEX idx_payrolls_payment_date ON payrolls(payment_date);

-- Add RLS (Row Level Security)
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage payrolls
CREATE POLICY "Users can manage payrolls" ON payrolls
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_payrolls_updated_at 
  BEFORE UPDATE ON payrolls 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to prevent duplicate payrolls for same employee/month/year
ALTER TABLE payrolls ADD CONSTRAINT unique_employee_month_year 
  UNIQUE (employee_id, reference_month, reference_year);
