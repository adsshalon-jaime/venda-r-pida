-- Script simplificado para remover constraint sales_category_check
-- Execute diretamente no SQL Editor do Supabase

-- 1. Remover constraint
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_category_check;

-- 2. Verificar se foi removida
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'sales'::regclass';
