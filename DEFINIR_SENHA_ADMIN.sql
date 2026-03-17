-- ============================================
-- DEFINIR SENHA PARA ADMIN MASTER
-- Execute este SQL no Supabase
-- ============================================

-- Definir senha: Admin123456
UPDATE auth.users
SET 
    encrypted_password = crypt('Admin123456', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'contato@nacionaltendas.com';

-- Verificar se foi atualizado
SELECT 
    id,
    email,
    email_confirmed_at,
    updated_at,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN 'Senha definida'
        ELSE 'Sem senha'
    END as status_senha
FROM auth.users
WHERE email = 'contato@nacionaltendas.com';

-- ============================================
-- CREDENCIAIS PARA LOGIN:
-- Email: contato@nacionaltendas.com
-- Senha: Admin123456
-- ============================================
