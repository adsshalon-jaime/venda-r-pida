-- Script para aplicar a migration manualmente
-- Execute este SQL no painel do Supabase

-- 1. Verificar se a constraint existe
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname = 'products_category_check';

-- 2. Remover a constraint se existir
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- 3. Verificar se foi removida
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname = 'products_category_check';

-- 4. Verificar produtos existentes por categoria
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY category;

-- 5. Inserir um produto de teste se não existir
INSERT INTO products (name, category, standard_meterage, base_price, price_per_square_meter, is_rental, created_at)
VALUES (
  'Kit de Ferragens para Tenda',
  'ferragem',
  0,
  150.00,
  false,
  false,
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6. Verificar se o produto foi inserido
SELECT * FROM products WHERE category = 'ferragem';
