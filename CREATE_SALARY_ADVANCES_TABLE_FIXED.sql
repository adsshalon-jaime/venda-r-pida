-- Criar tabela de adiantamentos salariais
CREATE TABLE IF NOT EXISTS salary_advances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reference_month TEXT NOT NULL,
  reference_year INTEGER NOT NULL,
  advance_amount DECIMAL(10, 2) NOT NULL,
  advance_percentage DECIMAL(5, 2) NOT NULL,
  gross_salary DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employer_name TEXT NOT NULL,
  employer_document TEXT NOT NULL,
  employer_address TEXT NOT NULL,
  used_in_payroll BOOLEAN DEFAULT FALSE,
  payroll_id UUID REFERENCES payrolls(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_salary_advances_employee_id ON salary_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_reference ON salary_advances(reference_month, reference_year);
CREATE INDEX IF NOT EXISTS idx_salary_advances_used ON salary_advances(used_in_payroll);

-- Habilitar RLS (Row Level Security)
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir e criar nova
DROP POLICY IF EXISTS "Permitir todas operações para usuários autenticados" ON salary_advances;

-- Criar política para permitir todas as operações para usuários autenticados
CREATE POLICY "Permitir todas operações para usuários autenticados" ON salary_advances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verificar se a tabela foi criada
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'salary_advances'
ORDER BY ordinal_position;
