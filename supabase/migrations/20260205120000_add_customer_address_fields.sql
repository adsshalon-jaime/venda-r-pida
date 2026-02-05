-- Adicionar campos CPF/CNPJ e endereço completo na tabela customers
-- Migration: 20260205120000_add_customer_address_fields

ALTER TABLE customers 
ADD COLUMN cpf_cnpj TEXT,
ADD COLUMN street TEXT,
ADD COLUMN number TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN customers.cpf_cnpj IS 'CPF ou CNPJ do cliente';
COMMENT ON COLUMN customers.street IS 'Rua do endereço do cliente';
COMMENT ON COLUMN customers.number IS 'Número do endereço do cliente';
COMMENT ON COLUMN customers.neighborhood IS 'Bairro do endereço do cliente';
COMMENT ON COLUMN customers.city IS 'Cidade do endereço do cliente';
COMMENT ON COLUMN customers.state IS 'Estado do endereço do cliente (UF)';
COMMENT ON COLUMN customers.zip_code IS 'CEP do endereço do cliente';
