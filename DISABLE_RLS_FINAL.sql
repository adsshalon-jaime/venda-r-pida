-- ============================================
-- SOLUÇÃO DEFINITIVA: DESABILITAR RLS
-- Se as políticas não funcionarem, use esta solução
-- ============================================

-- Desabilitar RLS completamente
ALTER TABLE payrolls DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('payrolls', 'employees', 'user_profiles')
ORDER BY tablename;

-- Todas devem retornar: rls_enabled = false
