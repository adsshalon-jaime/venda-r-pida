-- Adicionar campo de endereço nas configurações da empresa
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS address TEXT;

-- Verificar se foi adicionado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'company_settings';
