# Como Criar Usuário pelo Painel do Supabase

Já que o login pelo SQL não está funcionando, vamos criar o usuário diretamente pelo painel do Supabase:

## 📋 Passo a Passo

### 1. Acessar o Painel
- Vá para: https://supabase.com/dashboard
- Faça login
- Selecione seu projeto: **kpcqmwcyxleshekjtxdh**

### 2. Ir para Authentication
- No menu lateral esquerdo, clique em **"Authentication"**
- Clique em **"Users"**

### 3. Deletar Usuário Antigo (se existir)
- Procure por: `contato@nacionaltendas.com`
- Se encontrar, clique nos 3 pontinhos (...) ao lado
- Selecione **"Delete user"**
- Confirme a exclusão

### 4. Criar Novo Usuário
- Clique no botão **"Add user"** ou **"Invite user"**
- Selecione **"Create new user"**
- Preencha:
  - **Email**: `contato@nacionaltendas.com`
  - **Password**: `Nacional101020@`
  - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
- Clique em **"Create user"**

### 5. Verificar Usuário Criado
- O usuário deve aparecer na lista
- Status deve estar como **"Confirmed"**
- Email deve estar verificado

### 6. Fazer Login no Sistema
- Abra o sistema no navegador
- Faça logout se estiver logado
- Faça login com:
  - Email: `contato@nacionaltendas.com`
  - Senha: `Nacional101020@`

## ✅ Deve Funcionar!

Se ainda não funcionar, pode ser um problema na configuração do Supabase Client no código.

## 🔄 Alternativa: Usar Outro Email

Se você já tem outro email cadastrado no sistema que funciona, **use esse email mesmo**!

Como o RLS está desabilitado, qualquer usuário autenticado pode:
- Gerenciar funcionários
- Gerar holerites
- Acessar todas as funcionalidades

Não precisa necessariamente ser o `contato@nacionaltendas.com`.
