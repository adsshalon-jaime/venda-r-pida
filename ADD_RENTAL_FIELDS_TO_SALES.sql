-- Adicionar campos de locação na tabela sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rental_delivery_date DATE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rental_delivery_time TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rental_removal_date DATE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rental_installation_address TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rental_service_order_number TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rental_is_removed BOOLEAN DEFAULT FALSE;

-- Criar índice para buscar locações pendentes de remoção
CREATE INDEX IF NOT EXISTS idx_sales_rental_removal ON sales(rental_removal_date, rental_is_removed) WHERE is_rental = true;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sales' AND column_name LIKE 'rental%'
ORDER BY column_name;
