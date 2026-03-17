-- 1. Verificar se o usuário existe em user_profiles
SELECT * FROM user_profiles WHERE email = 'contato@nacionaltendas.com';

-- 2. Se retornar vazio, verificar se existe em auth.users
SELECT id, email FROM auth.users WHERE email = 'contato@nacionaltendas.com';

-- 3. Se existir em auth.users mas não em user_profiles, execute isso:
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'contato@nacionaltendas.com' LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        INSERT INTO user_profiles (id, email, role, full_name)
        VALUES (user_id, 'contato@nacionaltendas.com', 'admin_master', 'Administrador Master')
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin_master',
            updated_at = NOW();
        
        RAISE NOTICE 'Admin configurado com ID: %', user_id;
    ELSE
        RAISE NOTICE 'ERRO: Usuário não encontrado em auth.users. Você precisa fazer login primeiro!';
    END IF;
END $$;

-- 4. Verificar novamente
SELECT * FROM user_profiles WHERE email = 'contato@nacionaltendas.com';
