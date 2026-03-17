-- ============================================
-- CORRIGIR LOGIN - VERSÃO CORRIGIDA
-- ============================================

-- 1. Atualizar usuário (SEM confirmed_at que é gerado automaticamente)
UPDATE auth.users
SET 
    encrypted_password = crypt('Nacional101020@', gen_salt('bf')),
    email_confirmed_at = NOW(),
    email_change_confirm_status = 0,
    banned_until = NULL,
    aud = 'authenticated',
    role = 'authenticated',
    updated_at = NOW()
WHERE email = 'contato@nacionaltendas.com';

-- 2. Verificar se foi atualizado
SELECT 
    id,
    email,
    aud,
    role,
    encrypted_password IS NOT NULL as tem_senha,
    email_confirmed_at IS NOT NULL as email_confirmado,
    confirmed_at IS NOT NULL as confirmado,
    banned_until,
    deleted_at
FROM auth.users
WHERE email = 'contato@nacionaltendas.com';

-- Deve retornar:
-- tem_senha: true
-- email_confirmado: true
-- confirmado: true
-- banned_until: null
-- deleted_at: null

-- ============================================
-- CREDENCIAIS PARA LOGIN:
-- Email: contato@nacionaltendas.com
-- Senha: Nacional101020@
-- ============================================
