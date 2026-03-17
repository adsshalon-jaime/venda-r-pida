-- ============================================
-- CORRIGIR POLÍTICAS RLS DA TABELA PAYROLLS
-- Execute este SQL se ainda estiver com erro
-- ============================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can manage payrolls" ON payrolls;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON payrolls;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON payrolls;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON payrolls;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON payrolls;

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE payrolls DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se a tabela existe e está acessível
SELECT COUNT(*) as total_payrolls FROM payrolls;

-- ============================================
-- SE O SELECT ACIMA FUNCIONAR, EXECUTE ISSO:
-- ============================================

-- 4. Reabilitar RLS
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;

-- 5. Criar política permissiva para TODOS os usuários autenticados
CREATE POLICY "Allow all for authenticated users" 
ON payrolls
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'payrolls';

-- ============================================
-- ALTERNATIVA: POLÍTICA MAIS ESPECÍFICA
-- Se a política acima não funcionar, tente esta:
-- ============================================

/*
DROP POLICY IF EXISTS "Allow all for authenticated users" ON payrolls;

-- Política para SELECT
CREATE POLICY "Enable read for authenticated users"
ON payrolls FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT
CREATE POLICY "Enable insert for authenticated users"
ON payrolls FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE
CREATE POLICY "Enable update for authenticated users"
ON payrolls FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE
CREATE POLICY "Enable delete for authenticated users"
ON payrolls FOR DELETE
TO authenticated
USING (true);
*/
