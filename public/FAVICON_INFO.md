# 🎨 Favicon - Coberturas Shalon

## 📋 Informações

O favicon do sistema foi personalizado com a **logo oficial da Coberturas Shalon**.

---

## 📁 Arquivos do Favicon

### **1. favicon.svg** (Principal)
- **Localização**: `public/favicon.svg`
- **Formato**: SVG (vetorial)
- **Vantagens**: 
  - Escalável sem perda de qualidade
  - Tamanho pequeno de arquivo
  - Suporte moderno em todos os navegadores

### **2. favicon.ico** (Fallback)
- **Localização**: `public/favicon.ico`
- **Formato**: ICO (bitmap)
- **Uso**: Navegadores antigos que não suportam SVG

---

## 🎨 Design do Favicon

O favicon contém a logo completa da Coberturas Shalon:

```
┌─────────────────────────────┐
│  Ondas coloridas (decoração)│
│  - Dourado (#FFD700)        │
│  - Vermelho (#EF4444)       │
│  - Azul (#3B82F6)           │
│  - Índigo (#4F46E5)         │
│                             │
│  Texto "SHALON"             │
│  Texto "Tendas&Coberturas"  │
└─────────────────────────────┘
```

---

## 🔧 Configuração no HTML

O arquivo `index.html` está configurado com:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" href="/favicon.ico" />
```

**Ordem de prioridade:**
1. Navegadores modernos usam `favicon.svg`
2. Navegadores antigos usam `favicon.ico`

---

## 📱 Onde Aparece

O favicon é exibido em:
- ✅ Aba do navegador
- ✅ Favoritos/Bookmarks
- ✅ Histórico do navegador
- ✅ Atalhos na área de trabalho
- ✅ Barra de tarefas (quando fixado)

---

## 🔄 Como Atualizar

### **Opção 1: Substituir o SVG**
1. Edite o arquivo `public/favicon.svg`
2. Mantenha o mesmo nome de arquivo
3. Limpe o cache do navegador (Ctrl + F5)

### **Opção 2: Usar PNG/ICO**
1. Crie um arquivo PNG (32x32 ou 64x64)
2. Converta para ICO usando ferramentas online
3. Substitua `public/favicon.ico`

---

## 🌐 Metadados Atualizados

O `index.html` também foi atualizado com:

```html
<title>Coberturas Shalon - Sistema de Vendas</title>
<meta name="description" content="Sistema de Vendas - Coberturas Shalon - Tendas & Coberturas" />
<meta name="author" content="Coberturas Shalon" />
```

---

## ✅ Verificação

Para verificar se o favicon está funcionando:

1. Abra o sistema no navegador
2. Verifique a aba do navegador
3. Adicione aos favoritos
4. Limpe o cache se necessário: `Ctrl + Shift + Delete`

---

**Favicon personalizado com a identidade visual da Coberturas Shalon!** 🎉
