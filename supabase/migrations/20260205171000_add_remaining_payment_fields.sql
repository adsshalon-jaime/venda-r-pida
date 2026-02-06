-- Adicionar campos de pagamento restantes na tabela sales
-- Migration: 20260205171000_add_remaining_payment_fields

-- Adicionar apenas os campos que ainda não existem
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS payment_entry_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_installments INTEGER,
ADD COLUMN IF NOT EXISTS payment_due_date DATE;

-- Adicionar comentários para documentação
COMMENT ON COLUMN sales.payment_method IS 'Método de pagamento: dinheiro, pix, cartao ou fiado (venda a prazo)';
COMMENT ON COLUMN sales.payment_entry_value IS 'Valor da entrada para pagamentos com cartão';
COMMENT ON COLUMN sales.payment_installments IS 'Número de parcelas para pagamentos com cartão';
COMMENT ON COLUMN sales.payment_due_date IS 'Data de vencimento para vendas a prazo (até 30 dias)';
