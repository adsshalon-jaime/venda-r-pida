/**
 * Utilitários para formatação de moeda brasileira (BRL)
 */

/**
 * Formata um número para o padrão monetário brasileiro
 * @param value - Valor numérico para formatar
 * @returns String formatada como moeda BRL (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Remove caracteres não numéricos de uma string de moeda
 * @param value - String contendo valor monetário
 * @returns Número limpo (ex: "R$ 1.234,56" -> 1234.56)
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove tudo que não for número ou vírgula/ponto
  const cleanValue = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '') // Remove pontos de milhar
    .replace(',', '.'); // Converte vírgula decimal para ponto
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Aplica máscara de moeda brasileira enquanto o usuário digita
 * @param value - Valor de entrada
 * @returns String com máscara aplicada
 */
export function applyCurrencyMask(value: string): string {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly === '') return '';
  
  // Converte para número e formata
  const number = parseInt(numbersOnly, 10) / 100;
  
  // Formatação manual para ter mais controle
  const formatted = number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatted;
}

/**
 * Valida se uma string representa um valor monetário válido
 * @param value - String para validar
 * @returns true se for válido, false caso contrário
 */
export function isValidCurrency(value: string): boolean {
  if (!value) return false;
  
  const parsed = parseCurrency(value);
  return !isNaN(parsed) && parsed >= 0;
}

/**
 * Formata um input para exibição monetária brasileira
 * @param value - Valor numérico
 * @returns String formatada para input (ex: "1234,56")
 */
export function formatInputValue(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/**
 * Converte valor de input brasileiro para número
 * @param value - String do input (ex: "1234,56")
 * @returns Número correspondente
 */
export function parseInputValue(value: string): number {
  if (!value) return 0;
  
  const cleanValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}
