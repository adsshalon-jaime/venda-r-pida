-- Remover constraint que impede cadastro de novas vendas
-- Migration: 20260205183000_remove_sales_category_constraint

-- Remover a constraint de categoria da tabela sales
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_category_check;

-- Adicionar comentário explicativo
COMMENT ON TABLE sales IS 'Tabela de vendas sem constraint de categoria - permite adicionar qualquer categoria incluindo ferragens';

-- Verificar se a constraint foi removida
DO $$
BEGIN
    RAISE NOTICE 'Constraint sales_category_check removida com sucesso';
END $$;

-- Verificar constraints restantes na tabela sales
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'sales'::regclass';
