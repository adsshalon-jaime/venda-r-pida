-- Verificar se o admin master foi configurado corretamente

-- 1. Verificar perfil do usuário
SELECT 
    up.id,
    up.email,
    up.role,
    up.full_name,
    up.created_at
FROM user_profiles up
WHERE up.email = 'contato@nacionaltendas.com';

-- 2. Verificar se o usuário existe na tabela auth.users
SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'contato@nacionaltendas.com';

-- 3. Verificar políticas ativas
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('payrolls', 'employees', 'user_profiles')
ORDER BY tablename, policyname;

-- 4. Se o usuário não foi encontrado, execute isso:
-- (Descomente e execute se necessário)
/*
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'contato@nacionaltendas.com' LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        INSERT INTO user_profiles (id, email, role, full_name)
        VALUES (user_id, 'contato@nacionaltendas.com', 'admin_master', 'Administrador Master')
        ON CONFLICT (id) DO UPDATE SET role = 'admin_master', updated_at = NOW();
        
        RAISE NOTICE 'Admin configurado: %', user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado em auth.users';
    END IF;
END $$;
*/
