-- SOLUÇÃO RÁPIDA: Desabilitar RLS
ALTER TABLE payrolls DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'payrolls';
-- Deve retornar: rowsecurity = false
