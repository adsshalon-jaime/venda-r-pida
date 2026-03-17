# Instruções para Adicionar a Logo da Empresa

## Passo 1: Salvar a Logo

1. Salve a imagem da logo que você forneceu com o nome: `shalon-logo.png`
2. Coloque o arquivo na pasta: `public/`
3. Caminho final: `public/shalon-logo.png`

## Passo 2: Verificar

A logo já está configurada no componente `QuoteDocument.tsx` e será exibida automaticamente quando você:

1. Acessar a página de Orçamentos
2. Visualizar qualquer orçamento
3. Exportar o PDF

## Informações da Empresa Já Configuradas

✅ **Razão Social**: C R dos R Francisco LTDA
✅ **Nome Fantasia**: Coberturas Shalon
✅ **CNPJ**: 44.458.233/0001-08
✅ **Endereço**: Avenida Tocantins Com Av Ipanema, SN

## Fallback

Se a logo não carregar, o sistema exibirá automaticamente o texto "SHALON" como alternativa.

## Estrutura do Header

O header do orçamento agora inclui:
- Logo da empresa (128x128px)
- Nome "Coberturas Shalon"
- Subtítulo "Tendas & Coberturas"
- Dados da empresa (Razão Social, CNPJ, Endereço)
- Número do orçamento
- Data de emissão e validade
- Status do orçamento
