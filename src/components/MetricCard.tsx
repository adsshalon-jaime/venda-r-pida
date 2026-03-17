import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  className?: string;
  delay?: number;
  gradient?: string;
  iconColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  className, 
  delay = 0,
  gradient = "from-slate-50 to-slate-100/50",
  iconColor = "text-slate-600"
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/60 bg-white p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in backdrop-blur-sm",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity duration-500",
        gradient
      )} />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5 sm:space-y-2 flex-1">
          <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {value}
          </p>
          {change !== undefined && (
            <div className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
              isPositive 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                : "bg-rose-50 text-rose-700 border border-rose-200/50"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-lg group-hover:scale-110 transition-transform duration-500",
          "bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/60"
        )}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
