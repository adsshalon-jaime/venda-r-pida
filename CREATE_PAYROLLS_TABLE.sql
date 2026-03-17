-- ============================================
-- CRIAR TABELA DE HOLERITES (PAYROLLS)
-- Execute este SQL no painel do Supabase
-- ============================================

-- 1. Criar a tabela payrolls
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

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payrolls_employee_id ON payrolls(employee_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_reference_date ON payrolls(reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_payrolls_payment_date ON payrolls(payment_date);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de acesso (permitir tudo para usuários autenticados)
DROP POLICY IF EXISTS "Users can manage payrolls" ON payrolls;
CREATE POLICY "Users can manage payrolls" ON payrolls
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. Criar constraint para evitar duplicatas (mesmo funcionário/mês/ano)
ALTER TABLE payrolls 
DROP CONSTRAINT IF EXISTS unique_employee_month_year;

ALTER TABLE payrolls 
ADD CONSTRAINT unique_employee_month_year 
UNIQUE (employee_id, reference_month, reference_year);

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_payrolls_updated_at ON payrolls;
CREATE TRIGGER update_payrolls_updated_at
    BEFORE UPDATE ON payrolls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO
-- Execute este SELECT para confirmar que a tabela foi criada
-- ============================================
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'payrolls'
ORDER BY ordinal_position;
