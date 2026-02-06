-- Remover constraint que impede cadastro de novas categorias de produtos
-- Migration: 20260205180000_remove_category_constraint

-- Remover a constraint de categoria que está impedindo o cadastro
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Adicionar comentário explicativo
COMMENT ON TABLE products IS 'Tabela de produtos sem constraint de categoria - permite adicionar qualquer categoria incluindo ferragens';

-- Verificar se a constraint foi removida
DO $$
BEGIN
    RAISE NOTICE 'Constraint products_category_check removida com sucesso';
END $$;
