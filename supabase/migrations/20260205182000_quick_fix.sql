-- SCRIPT SIMPLIFICADO - COPIE E COLE DIRETAMENTE NO SUPABASE

-- 1. Remover constraint que impede cadastro de ferragens
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- 2. Inserir produto de ferragem de teste
INSERT INTO products (name, category, standard_meterage, base_price, price_per_square_meter, is_rental, created_at)
VALUES (
  'Kit de Ferragens para Tenda',
  'ferragem',
  0,
  150.00,
  false,
  false,
  NOW()
);

-- 3. Verificar se foi inserido
SELECT * FROM products WHERE category = 'ferragem';
