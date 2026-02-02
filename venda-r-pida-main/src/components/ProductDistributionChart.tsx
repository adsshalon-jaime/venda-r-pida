import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface ProductDistributionChartProps {
  lonasSold: number;
  tendasSold: number;
  className?: string;
}

export function ProductDistributionChart({ lonasSold, tendasSold, className }: ProductDistributionChartProps) {
  const data = [
    { name: 'Lonas', value: lonasSold, color: 'hsl(160, 84%, 39%)' },
    { name: 'Tendas', value: tendasSold, color: 'hsl(220, 70%, 50%)' },
  ];

  const total = lonasSold + tendasSold;

  return (
    <div className={cn("metric-card animate-fade-in", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Distribuição de Vendas</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(0)}%)`,
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold">{lonasSold}</p>
          <p className="text-xs text-muted-foreground">Lonas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{tendasSold}</p>
          <p className="text-xs text-muted-foreground">Tendas</p>
        </div>
      </div>
    </div>
  );
}
