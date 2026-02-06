import { AlertCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface OverdueAlertProps {
  totalOverdue: number;
  overdueCount: number;
  totalDueSoon: number;
  dueSoonCount: number;
}

export function OverdueAlert({ totalOverdue, overdueCount, totalDueSoon, dueSoonCount }: OverdueAlertProps) {
  if (totalOverdue === 0 && totalDueSoon === 0) {
    return null;
  }

  const hasOverdue = totalOverdue > 0;
  const hasDueSoon = totalDueSoon > 0;

  return (
    <div className="space-y-4">
      {/* Alerta de Contas Vencidas */}
      {hasOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-red-800">Contas Vencidas</h3>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOverdue)}
                </span>
              </div>
              <p className="text-sm text-red-700 mb-2">
                Você tem {overdueCount} {overdueCount === 1 ? 'venda vencida' : 'vendas vencidas'} que precisam de atenção.
              </p>
              <div className="flex items-center gap-2 text-xs text-red-600">
                <Calendar className="h-3 w-3" />
                <span>Entre em contato com os clientes para regularizar os pagamentos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Contas a Vencer */}
      {hasDueSoon && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-800">Contas a Vencer (7 dias)</h3>
                <span className="text-2xl font-bold text-amber-600">
                  {formatCurrency(totalDueSoon)}
                </span>
              </div>
              <p className="text-sm text-amber-700 mb-2">
                Você tem {dueSoonCount} {dueSoonCount === 1 ? 'venda' : 'vendas'} que vencerão nos próximos 7 dias.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <Calendar className="h-3 w-3" />
                <span>Entre em contato antecipadamente com os clientes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
