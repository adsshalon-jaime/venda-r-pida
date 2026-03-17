-- ============================================
-- VERIFICAR E CRIAR USUÁRIO ADMIN
-- ============================================

-- 1. Verificar se o usuário existe em auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'contato@nacionaltendas.com';

-- Se retornar VAZIO, o usuário NÃO existe e você precisa:
-- OPÇÃO A: Criar conta pela interface do sistema (recomendado)
-- OPÇÃO B: Criar diretamente no Supabase (abaixo)

-- ============================================
-- CRIAR USUÁRIO DIRETAMENTE NO SUPABASE
-- Execute apenas se a query acima retornar vazio
-- ============================================

-- IMPORTANTE: Substitua 'SUA_SENHA_AQUI' por uma senha real
-- Exemplo: 'Admin@2026' ou qualquer senha que você queira usar

/*
-- Criar usuário no auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'contato@nacionaltendas.com',
    crypt('SUA_SENHA_AQUI', gen_salt('bf')), -- SUBSTITUA 'SUA_SENHA_AQUI'
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) RETURNING id, email;
*/

-- ============================================
-- ALTERNATIVA MAIS SIMPLES
-- ============================================
-- Vá para a interface do Supabase:
-- 1. Authentication > Users
-- 2. Clique em "Add user"
-- 3. Email: contato@nacionaltendas.com
-- 4. Password: (escolha uma senha)
-- 5. Clique em "Create user"
-- 6. Execute o script abaixo para adicionar ao user_profiles
