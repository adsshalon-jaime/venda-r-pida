import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface MonthSelectorProps {
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [internalSelectedMonth, setInternalSelectedMonth] = useState(currentMonth);
  
  const monthValue = selectedMonth || internalSelectedMonth;
  const setMonth = onMonthChange || setInternalSelectedMonth;

  // Gerar últimos 6 meses + mês atual
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i <= 6; i++) {
      const targetDate = subMonths(currentDate, i);
      const monthValue = format(targetDate, 'yyyy-MM');
      const monthLabel = format(targetDate, "MMMM 'de' yyyy", { locale: ptBR });
      
      months.push({
        value: monthValue,
        label: monthLabel,
        current: monthValue === currentMonth,
        archived: monthValue !== currentMonth
      });
    }
    
    return months;
  };

  const months = generateMonths();

  const getCurrentMonthBadge = () => {
    const currentMonthData = months.find(m => m.current);
    return currentMonthData ? (
      <Badge variant="default" className="ml-2">
        📅 Atual
      </Badge>
    ) : null;
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={monthValue} onValueChange={setMonth}>
        <SelectTrigger className="w-64">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Selecione o mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              <div className="flex items-center justify-between w-full">
                <span>{month.label}</span>
                {month.current && <span className="ml-2">📅</span>}
                {month.archived && <span className="ml-2">📁</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {getCurrentMonthBadge()}
    </div>
  );
}
