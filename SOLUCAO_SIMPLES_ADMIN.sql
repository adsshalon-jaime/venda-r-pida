-- ============================================
-- SOLUÇÃO SIMPLES: DESABILITAR RLS E PERMITIR TUDO
-- Recomendado para desenvolvimento/uso interno
-- ============================================

-- 1. Desabilitar RLS em todas as tabelas principais
ALTER TABLE payrolls DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('payrolls', 'employees')
ORDER BY tablename;

-- Deve retornar:
-- payrolls   | false
-- employees  | false

-- ============================================
-- PRONTO! Agora todos os usuários autenticados
-- podem gerenciar funcionários e holerites
-- ============================================
