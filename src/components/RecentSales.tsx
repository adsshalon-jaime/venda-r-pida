import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/types';
import { cn } from '@/lib/utils';
import { User, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface RecentSalesProps {
  sales: Sale[];
  className?: string;
  showMonthBadge?: boolean;
  selectedMonth?: string;
}

export function RecentSales({ sales, className, showMonthBadge = false, selectedMonth }: RecentSalesProps) {
  const getMonthBadge = (sale: Sale) => {
    if (!showMonthBadge || !selectedMonth) return null;
    
    const saleMonth = format(new Date(sale.createdAt), 'yyyy-MM');
    const isCurrentMonth = saleMonth === selectedMonth;
    
    return (
      <Badge 
        variant={isCurrentMonth ? "default" : "secondary"}
        className="text-xs"
      >
        {isCurrentMonth ? " Atual" : " Anterior"}
      </Badge>
    );
  };

  return (
    <div className={cn("metric-card animate-fade-in", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Vendas Recentes {showMonthBadge && `(Filtrado)`}
      </h3>
      <div className="space-y-4">
        {sales.slice(0, 5).map((sale, index) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-slide-in-right"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{sale.productName}</p>
                {getMonthBadge(sale)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    sale.category === 'lona' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  )}
                >
                  {sale.category === 'lona' ? 'Lona' : 'Tenda'}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(sale.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              {sale.customerId && (
                <div className="flex items-center gap-1 mt-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {/* Aqui você pode adicionar o nome do cliente se tiver */}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(sale.totalValue)}</p>
              {sale.quantity && (
                <p className="text-xs text-muted-foreground">Qtd: {sale.quantity}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
