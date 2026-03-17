import { AlertCircle, Calendar, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { Sale } from '@/types';

interface OverdueAlertProps {
  totalOverdue: number;
  overdueCount: number;
  totalDueSoon: number;
  dueSoonCount: number;
  overdueSales?: Sale[];
  onMarkAsPaid?: (saleId: string) => void;
}

export function OverdueAlert({ 
  totalOverdue, 
  overdueCount, 
  totalDueSoon, 
  dueSoonCount,
  overdueSales = [],
  onMarkAsPaid
}: OverdueAlertProps) {
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
              <div className="flex items-center gap-2 text-xs text-red-600 mb-4">
                <Calendar className="h-3 w-3" />
                <span>Entre em contato com os clientes para regularizar os pagamentos</span>
              </div>

              {/* Lista de vendas vencidas */}
              {overdueSales.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Vendas Vencidas:</h4>
                  {overdueSales.map((sale) => (
                    <div 
                      key={sale.id} 
                      className="bg-white border border-red-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{sale.customerName || 'Cliente não informado'}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{sale.productName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Venceu em: {sale.paymentInfo?.dueDate ? new Date(sale.paymentInfo.dueDate).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(sale.totalValue)}
                          </span>
                        </div>
                      </div>
                      
                      {onMarkAsPaid && (
                        <button
                          onClick={() => onMarkAsPaid(sale.id)}
                          className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold text-sm shadow-md"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Dar Baixa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
