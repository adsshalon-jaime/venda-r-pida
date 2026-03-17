-- ============================================
-- TESTE DE INSERÇÃO MANUAL DE HOLERITE
-- Execute este SQL para testar se a inserção funciona
-- ============================================

-- 1. Verificar se há funcionários cadastrados
SELECT id, name, salary FROM employees LIMIT 5;

-- 2. Teste de inserção com dados reais
-- IMPORTANTE: Substitua o UUID abaixo pelo ID de um funcionário real da query acima
INSERT INTO payrolls (
    employee_id,
    reference_month,
    reference_year,
    gross_salary,
    deductions,
    additions,
    net_salary,
    payment_date,
    employer_name,
    employer_document,
    employer_address
) VALUES (
    (SELECT id FROM employees LIMIT 1), -- Pega automaticamente o primeiro funcionário
    '03',
    2026,
    2500.00,
    '{"inss": 200.00, "fgts": 200.00, "irrf": 50.00, "other": 0.00, "total": 450.00}'::jsonb,
    '{"overtime": 0.00, "bonuses": 0.00, "vacation": 0.00, "thirteenth": 0.00, "other": 0.00, "total": 0.00}'::jsonb,
    2050.00,
    '2026-03-16',
    'Empresa Teste',
    '00.000.000/0001-00',
    'Rua Teste, 123'
) RETURNING *;

-- 3. Verificar se foi inserido
SELECT 
    p.*,
    e.name as employee_name,
    e.salary as employee_salary
FROM payrolls p
JOIN employees e ON e.id = p.employee_id
ORDER BY p.created_at DESC
LIMIT 5;

-- 4. Se funcionou, limpar o teste
-- DELETE FROM payrolls WHERE employer_name = 'Empresa Teste';
