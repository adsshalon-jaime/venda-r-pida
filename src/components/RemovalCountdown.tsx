import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface RemovalCountdownProps {
  sale: Sale;
  onViewDetails?: (sale: Sale) => void;
}

export function RemovalCountdown({ sale, onViewDetails }: RemovalCountdownProps) {
  if (!sale.rentalInfo?.removalDate || sale.rentalInfo?.isRemoved) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const removalDate = new Date(sale.rentalInfo.removalDate);
  removalDate.setHours(0, 0, 0, 0);

  const deliveryDate = sale.rentalInfo.deliveryDate 
    ? new Date(sale.rentalInfo.deliveryDate) 
    : today;
  deliveryDate.setHours(0, 0, 0, 0);

  // Calcular dias restantes
  const daysRemaining = Math.ceil((removalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular total de dias da locação
  const totalDays = Math.ceil((removalDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular porcentagem de progresso (inverso - quanto mais próximo da remoção, mais cheio)
  const percentage = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)) : 0;

  // Determinar cor e status baseado nos dias restantes
  let barColor = 'bg-green-500';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let textColor = 'text-green-700';
  let status = 'Normal';
  let icon = <Clock className="h-4 w-4" />;

  if (daysRemaining < 0) {
    // Atrasado
    barColor = 'bg-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-300';
    textColor = 'text-red-700';
    status = 'EXPIRADO';
    icon = <AlertTriangle className="h-4 w-4 animate-pulse" />;
  } else if (daysRemaining === 0) {
    // Hoje
    barColor = 'bg-red-500';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-300';
    textColor = 'text-red-700';
    status = 'HOJE';
    icon = <AlertTriangle className="h-4 w-4" />;
  } else if (daysRemaining <= 2) {
    // Próximo (2 dias ou menos)
    barColor = 'bg-orange-500';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-300';
    textColor = 'text-orange-700';
    status = 'Urgente';
    icon = <AlertTriangle className="h-4 w-4" />;
  } else if (daysRemaining <= 5) {
    // Atenção (5 dias ou menos)
    barColor = 'bg-amber-500';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-300';
    textColor = 'text-amber-700';
    status = 'Atenção';
    icon = <Clock className="h-4 w-4" />;
  }

  return (
    <div 
      className={`${bgColor} border ${borderColor} rounded-lg p-4 transition-all hover:shadow-md cursor-pointer`}
      onClick={() => onViewDetails?.(sale)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{sale.customerName}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${textColor} ${bgColor} border ${borderColor}`}>
              {status}
            </span>
          </div>
          <div className="text-sm text-gray-600">{sale.productName}</div>
          <div className="text-xs text-gray-500 mt-1">
            OS #{sale.rentalInfo.serviceOrderNumber} • {formatCurrency(sale.totalValue)}
          </div>
        </div>
        <div className={`${textColor} flex items-center gap-1`}>
          {icon}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Progresso da locação</span>
          <span className={`font-bold ${textColor}`}>
            {daysRemaining < 0 
              ? `${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'dia' : 'dias'} atrasado`
              : daysRemaining === 0
              ? 'Remover HOJE'
              : `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} restantes`
            }
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="h-3 w-3 text-green-600" />
          <span>Entrega: {deliveryDate.toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className={`h-3 w-3 ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 2 ? 'text-orange-600' : 'text-gray-600'}`} />
          <span className={daysRemaining < 0 ? 'text-red-600 font-bold' : daysRemaining <= 2 ? 'text-orange-600 font-semibold' : 'text-gray-600'}>
            Remoção: {removalDate.toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Endereço */}
      {sale.rentalInfo.installationAddress && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          📍 {sale.rentalInfo.installationAddress}
        </div>
      )}
    </div>
  );
}
