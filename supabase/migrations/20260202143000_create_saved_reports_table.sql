-- Create table for saved reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sales', 'products', 'customers')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_saved_reports_type ON saved_reports(type);
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_at ON saved_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_reports_dates ON saved_reports(start_date, end_date);

-- Add comments
COMMENT ON TABLE saved_reports IS 'Table for storing generated reports';
COMMENT ON COLUMN saved_reports.title IS 'Report title';
COMMENT ON COLUMN saved_reports.type IS 'Report type: sales, products, or customers';
COMMENT ON COLUMN saved_reports.start_date IS 'Start date of the report period';
COMMENT ON COLUMN saved_reports.end_date IS 'End date of the report period';
COMMENT ON COLUMN saved_reports.data IS 'Report data in JSON format';

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_reports_updated_at 
    BEFORE UPDATE ON saved_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
