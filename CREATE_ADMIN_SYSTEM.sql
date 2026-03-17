-- ============================================
-- SISTEMA DE PERMISSÕES COM ADMIN MASTER
-- Execute este SQL no Supabase
-- ============================================

-- 1. Criar tabela de perfis de usuário (se não existir)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 3. Habilitar RLS na tabela user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Política para permitir usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- 5. Política para admin master gerenciar todos os perfis
CREATE POLICY "Admin master can manage all profiles"
ON user_profiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin_master'
    )
);

-- 6. Buscar o ID do usuário contato@nacionaltendas.com
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'contato@nacionaltendas.com'
    LIMIT 1;

    -- Se encontrou o usuário, criar/atualizar o perfil
    IF user_id IS NOT NULL THEN
        INSERT INTO user_profiles (id, email, role, full_name)
        VALUES (user_id, 'contato@nacionaltendas.com', 'admin_master', 'Administrador Master')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin_master',
            updated_at = NOW();
        
        RAISE NOTICE 'Usuário % configurado como admin_master', user_id;
    ELSE
        RAISE NOTICE 'Usuário contato@nacionaltendas.com não encontrado na tabela auth.users';
    END IF;
END $$;

-- 7. Verificar se o usuário foi configurado corretamente
SELECT 
    up.id,
    up.email,
    up.role,
    up.full_name,
    au.email as auth_email,
    au.created_at as user_created_at
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.id
WHERE up.email = 'contato@nacionaltendas.com';

-- ============================================
-- CONFIGURAR POLÍTICAS RLS PARA PAYROLLS
-- ============================================

-- 8. Remover políticas antigas de payrolls
DROP POLICY IF EXISTS "Allow all for authenticated users" ON payrolls;
DROP POLICY IF EXISTS "Users can manage payrolls" ON payrolls;
DROP POLICY IF EXISTS "payrolls_select_policy" ON payrolls;
DROP POLICY IF EXISTS "payrolls_insert_policy" ON payrolls;
DROP POLICY IF EXISTS "payrolls_update_policy" ON payrolls;
DROP POLICY IF EXISTS "payrolls_delete_policy" ON payrolls;

-- 9. Habilitar RLS em payrolls
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;

-- 10. Política para admin master ter acesso total
CREATE POLICY "Admin master full access to payrolls"
ON payrolls FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin_master'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin_master'
    )
);

-- 11. Política para usuários comuns (opcional - descomente se necessário)
/*
CREATE POLICY "Users can manage own payrolls"
ON payrolls FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('user', 'manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('user', 'manager')
    )
);
*/

-- ============================================
-- APLICAR MESMAS POLÍTICAS PARA EMPLOYEES
-- ============================================

-- 12. Configurar RLS para employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can manage employees" ON employees;
DROP POLICY IF EXISTS "Admin master full access to employees" ON employees;

-- Política para admin master
CREATE POLICY "Admin master full access to employees"
ON employees FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin_master'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin_master'
    )
);

-- ============================================
-- VERIFICAÇÕES FINAIS
-- ============================================

-- 13. Verificar perfil do admin master
SELECT 
    'Admin Master Profile' as check_type,
    email,
    role,
    full_name
FROM user_profiles
WHERE role = 'admin_master';

-- 14. Verificar políticas de payrolls
SELECT 
    'Payrolls Policies' as check_type,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'payrolls';

-- 15. Verificar políticas de employees
SELECT 
    'Employees Policies' as check_type,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'employees';

-- 16. Verificar RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('payrolls', 'employees', 'user_profiles')
ORDER BY tablename;
