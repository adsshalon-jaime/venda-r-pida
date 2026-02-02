import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/types';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface RecentSalesProps {
  sales: Sale[];
  className?: string;
}

export function RecentSales({ sales, className }: RecentSalesProps) {
  return (
    <div className={cn("metric-card animate-fade-in", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Vendas Recentes</h3>
      <div className="space-y-4">
        {sales.slice(0, 5).map((sale, index) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-slide-in-right"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{sale.productName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    sale.category === 'lona'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-chart-2/10 text-chart-2'
                  )}
                >
                  {sale.category === 'lona' ? 'Lona' : 'Tenda'}
                </Badge>
                {sale.squareMeters && (
                  <span className="text-xs text-muted-foreground">
                    {sale.squareMeters.toFixed(1)} m²
                  </span>
                )}
                {sale.quantity && (
                  <span className="text-xs text-muted-foreground">
                    {sale.quantity}x unidades
                  </span>
                )}
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-success">
                {formatCurrency(sale.totalValue)}
              </p>
              <div className="flex items-center gap-1 justify-end mt-1">
                {sale.customerName ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {sale.customerName}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Venda Direta</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
