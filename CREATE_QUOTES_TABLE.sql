-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_deadline TEXT NOT NULL,
  valid_until DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cartao', 'boleto', 'transferencia', 'pix')),
  payment_installments INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  converted_to_sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS quotes_updated_at_trigger ON quotes;
CREATE TRIGGER quotes_updated_at_trigger
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();

-- Comentários nas colunas
COMMENT ON TABLE quotes IS 'Tabela de orçamentos gerados para clientes';
COMMENT ON COLUMN quotes.quote_number IS 'Número único do orçamento (ex: ORC-20260317-001)';
COMMENT ON COLUMN quotes.items IS 'Array JSON com os itens do orçamento';
COMMENT ON COLUMN quotes.payment_method IS 'Forma de pagamento: cartao, boleto, transferencia, pix';
COMMENT ON COLUMN quotes.payment_installments IS 'Número de parcelas (usado apenas para cartão)';
COMMENT ON COLUMN quotes.status IS 'Status do orçamento: pending, approved, rejected, converted';
COMMENT ON COLUMN quotes.converted_to_sale_id IS 'ID da venda quando o orçamento é convertido';
