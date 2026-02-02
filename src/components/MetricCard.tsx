import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  className?: string;
  delay?: number;
}

export function MetricCard({ title, value, change, icon: Icon, className, delay = 0 }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div 
      className={cn("metric-card animate-fade-in", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
              <span className="text-muted-foreground font-normal">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
