-- Adicionar campos de forma de pagamento à tabela quotes existente
-- Execute este script se a tabela quotes já existir

-- Adicionar coluna payment_method
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Adicionar coluna payment_installments
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS payment_installments INTEGER DEFAULT 1;

-- Atualizar registros existentes com valor padrão
UPDATE quotes 
SET payment_method = 'pix' 
WHERE payment_method IS NULL;

-- Adicionar constraint após atualizar os dados
ALTER TABLE quotes 
ADD CONSTRAINT quotes_payment_method_check 
CHECK (payment_method IN ('cartao', 'boleto', 'transferencia', 'pix'));

-- Tornar payment_method obrigatório
ALTER TABLE quotes 
ALTER COLUMN payment_method SET NOT NULL;

-- Adicionar comentários
COMMENT ON COLUMN quotes.payment_method IS 'Forma de pagamento: cartao, boleto, transferencia, pix';
COMMENT ON COLUMN quotes.payment_installments IS 'Número de parcelas (usado apenas para cartão)';
