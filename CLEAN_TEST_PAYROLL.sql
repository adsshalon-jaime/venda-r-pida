-- Limpar o registro de teste
DELETE FROM payrolls WHERE employer_name = 'Empresa Teste';

-- Verificar se foi removido
SELECT COUNT(*) as total FROM payrolls;
