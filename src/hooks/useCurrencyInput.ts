import { useState, useCallback } from 'react';
import { formatCurrency, parseCurrency } from '@/utils/currency';

/**
 * Hook React para gerenciar input de moeda brasileira
 * @param initialValue - Valor inicial
 * @returns [valorFormatado, valorNumérico, funçãoDeAtualização, funçãoDeDefinição]
 */
export function useCurrencyInput(initialValue: number = 0) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(initialValue));
  const [numericValue, setNumericValue] = useState(initialValue);
  
  const updateValue = useCallback((value: string) => {
    // Permite digitar números diretamente sem formatação automática
    if (value === '' || value === 'R$ ' || value === 'R$') {
      setDisplayValue('');
      setNumericValue(0);
      return;
    }
    
    // Remove o prefixo R$ se existir
    const cleanValue = value.replace(/^R\$\s*/, '');
    
    // Se for apenas números, permite digitar
    if (/^\d*\.?\d{0,2}$/.test(cleanValue)) {
      setDisplayValue(value);
      const parsed = parseFloat(cleanValue.replace(',', '.')) || 0;
      setNumericValue(parsed);
    } else {
      // Aplica formatação apenas quando necessário
      const parsed = parseCurrency(value);
      setNumericValue(parsed);
      setDisplayValue(formatCurrency(parsed));
    }
  }, []);
  
  const setValue = useCallback((value: number) => {
    setNumericValue(value);
    setDisplayValue(formatCurrency(value));
  }, []);
  
  return [displayValue, numericValue, updateValue, setValue] as const;
}
