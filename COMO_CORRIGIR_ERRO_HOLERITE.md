# 🔧 Como Corrigir o Erro ao Gerar Holerite

## ❌ Problema
Ao clicar em "Gerar Holerite", aparece o erro: **"Erro ao gerar holerite"**

## ✅ Solução
A tabela `payrolls` não existe no banco de dados Supabase. Você precisa criá-la manualmente.

---

## 📋 Passo a Passo

### **1. Acessar o Painel do Supabase**
1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login na sua conta
4. Selecione o projeto: **kpcqmwcyxleshekjtxdh**

### **2. Abrir o SQL Editor**
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

### **3. Executar o SQL**
1. Abra o arquivo: `CREATE_PAYROLLS_TABLE.sql` (na raiz do projeto)
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **"Run"** (Executar) ou pressione `Ctrl + Enter`

### **4. Verificar se Funcionou**
Você deve ver a mensagem: ✅ **"Success. No rows returned"**

Se aparecer algum erro, leia a mensagem e tente novamente.

### **5. Testar no Sistema**
1. Volte para o sistema de holerites
2. Clique em **"Novo Holerite"**
3. Selecione um funcionário
4. Preencha os dados
5. Clique em **"Gerar Holerite"**

Agora deve funcionar! 🎉

---

## 🔍 Verificação Rápida

Se quiser verificar se a tabela foi criada corretamente, execute este SQL:

```sql
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'payrolls'
ORDER BY ordinal_position;
```

Você deve ver 13 colunas listadas.

---

## 📊 Estrutura da Tabela Criada

A tabela `payrolls` terá os seguintes campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do holerite |
| `employee_id` | UUID | Referência ao funcionário |
| `reference_month` | TEXT | Mês de referência (01-12) |
| `reference_year` | INTEGER | Ano de referência |
| `gross_salary` | DECIMAL | Salário bruto |
| `deductions` | JSONB | Deduções (INSS, FGTS, IRRF, etc.) |
| `additions` | JSONB | Adicionais (horas extras, etc.) |
| `net_salary` | DECIMAL | Salário líquido |
| `payment_date` | TEXT | Data de pagamento |
| `employer_name` | TEXT | Nome da empresa |
| `employer_document` | TEXT | CNPJ/CPF da empresa |
| `employer_address` | TEXT | Endereço da empresa |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

---

## 🛡️ Segurança

A tabela já vem configurada com:
- ✅ **Row Level Security (RLS)** ativado
- ✅ **Política de acesso** para usuários autenticados
- ✅ **Constraint único** para evitar duplicatas
- ✅ **Índices** para melhor performance

---

## ❓ Problemas Comuns

### **Erro: "relation employees does not exist"**
**Solução:** A tabela `employees` não existe. Você precisa criá-la primeiro.

### **Erro: "permission denied"**
**Solução:** Você não tem permissão. Verifique se está logado como administrador do projeto.

### **Erro: "already exists"**
**Solução:** A tabela já existe! O erro pode ser outro. Verifique os logs do navegador (F12 > Console).

---

## 🎯 Próximos Passos

Após criar a tabela:
1. ✅ Gere um holerite de teste
2. ✅ Visualize o holerite gerado
3. ✅ Teste a impressão em duas vias
4. ✅ Verifique os cálculos de deduções

---

## 📞 Suporte

Se o erro persistir após executar o SQL:
1. Abra o Console do navegador (F12)
2. Vá para a aba "Console"
3. Tente gerar o holerite novamente
4. Copie a mensagem de erro completa
5. Me envie a mensagem para análise

---

**Última atualização:** 16/03/2026
