-- ============================================
-- CORRIGIR POLÍTICAS RLS - SOLUÇÃO DEFINITIVA
-- ============================================

-- 1. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Admin master full access to payrolls" ON payrolls;
DROP POLICY IF EXISTS "Admin master full access to employees" ON employees;
DROP POLICY IF EXISTS "Users can manage payrolls" ON payrolls;
DROP POLICY IF EXISTS "Enable all operations for employees" ON employees;

-- 2. Criar políticas PERMISSIVAS para PUBLIC (qualquer usuário autenticado)
-- Isso permite que qualquer usuário autenticado acesse as tabelas

-- Políticas para PAYROLLS
CREATE POLICY "Allow all authenticated users - payrolls"
ON payrolls
FOR ALL
TO public
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Políticas para EMPLOYEES
CREATE POLICY "Allow all authenticated users - employees"
ON employees
FOR ALL
TO public
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Verificar políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('payrolls', 'employees')
ORDER BY tablename, policyname;

-- 4. Verificar status RLS
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('payrolls', 'employees')
ORDER BY tablename;
