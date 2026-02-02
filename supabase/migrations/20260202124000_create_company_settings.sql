-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL DEFAULT 'Tendas & Lonas',
  cnpj VARCHAR(20),
  phone VARCHAR(20),
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_settings_updated_at 
  BEFORE UPDATE ON company_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if table is empty
INSERT INTO company_settings (company_name, cnpj, phone, theme, notifications_enabled)
SELECT 'Tendas & Lonas', '', '', 'light', true
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Enable RLS (Row Level Security)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (everyone can read settings)
CREATE POLICY "Company settings are viewable by everyone" ON company_settings
  FOR SELECT USING (true);

-- Create policy for insert/update (everyone can modify settings)
CREATE POLICY "Company settings are editable by everyone" ON company_settings
  FOR ALL USING (true);
