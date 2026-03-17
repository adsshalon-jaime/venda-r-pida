-- ============================================
-- CORRIGIR PROBLEMA DE LOGIN
-- ============================================

-- 1. Verificar status completo do usuário
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as tem_senha,
    email_confirmed_at IS NOT NULL as email_confirmado,
    confirmed_at,
    banned_until,
    deleted_at,
    is_sso_user,
    created_at,
    updated_at
FROM auth.users
WHERE email = 'contato@nacionaltendas.com';

-- 2. Atualizar usuário com todos os campos necessários
UPDATE auth.users
SET 
    encrypted_password = crypt('Nacional101020@', gen_salt('bf')),
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    email_change_confirm_status = 0,
    banned_until = NULL,
    deleted_at = NULL,
    is_sso_user = false,
    aud = 'authenticated',
    role = 'authenticated',
    updated_at = NOW()
WHERE email = 'contato@nacionaltendas.com';

-- 3. Verificar novamente
SELECT 
    id,
    email,
    aud,
    role,
    encrypted_password IS NOT NULL as tem_senha,
    email_confirmed_at IS NOT NULL as email_confirmado,
    confirmed_at IS NOT NULL as confirmado
FROM auth.users
WHERE email = 'contato@nacionaltendas.com';

-- ============================================
-- ALTERNATIVA: Criar novo usuário do zero
-- Execute apenas se o UPDATE acima não resolver
-- ============================================

/*
-- Deletar usuário antigo
DELETE FROM auth.users WHERE email = 'contato@nacionaltendas.com';

-- Criar novo usuário
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'contato@nacionaltendas.com',
    crypt('Nacional101020@', gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Master"}',
    false,
    NOW(),
    NOW()
) RETURNING id, email;
*/

-- ============================================
-- CREDENCIAIS:
-- Email: contato@nacionaltendas.com
-- Senha: Nacional101020@
-- ============================================
