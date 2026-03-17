import { Truck, Calendar, MapPin, CheckCircle, Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { Sale } from '@/types';
import { Button } from '@/components/ui/button';

interface RentalAlertProps {
  pendingRemovals: Sale[];
  onViewServiceOrder?: (sale: Sale) => void;
  onMarkAsRemoved?: (saleId: string) => void;
}

export function RentalAlert({ pendingRemovals, onViewServiceOrder, onMarkAsRemoved }: RentalAlertProps) {
  if (pendingRemovals.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueRemovals = pendingRemovals.filter(sale => {
    if (!sale.rentalInfo?.removalDate) return false;
    const removalDate = new Date(sale.rentalInfo.removalDate);
    removalDate.setHours(0, 0, 0, 0);
    return removalDate < today;
  });

  const upcomingRemovals = pendingRemovals.filter(sale => {
    if (!sale.rentalInfo?.removalDate) return false;
    const removalDate = new Date(sale.rentalInfo.removalDate);
    removalDate.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return removalDate >= today && removalDate <= nextWeek;
  });

  return (
    <div className="space-y-4">
      {/* Remoções Atrasadas */}
      {overdueRemovals.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <Truck className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-red-800">Remoções Atrasadas</h3>
                <span className="text-xl font-bold text-red-600">
                  {overdueRemovals.length} {overdueRemovals.length === 1 ? 'locação' : 'locações'}
                </span>
              </div>
              <p className="text-sm text-red-700 mb-4">
                Atenção! Há locações com data de remoção vencida.
              </p>

              {/* Lista de remoções atrasadas */}
              <div className="space-y-2">
                {overdueRemovals.map((sale) => (
                  <div 
                    key={sale.id} 
                    className="bg-white border border-red-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{sale.customerName || 'Cliente não informado'}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{sale.productName}</span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            OS #{sale.rentalInfo?.serviceOrderNumber}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-green-600" />
                            <span>Entrega: {sale.rentalInfo?.deliveryDate ? new Date(sale.rentalInfo.deliveryDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            {sale.rentalInfo?.deliveryTime && <span className="text-gray-500">às {sale.rentalInfo.deliveryTime}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-red-600" />
                            <span className="font-semibold text-red-600">
                              Remoção: {sale.rentalInfo?.removalDate ? new Date(sale.rentalInfo.removalDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 col-span-2">
                            <MapPin className="h-3 w-3" />
                            <span>{sale.rentalInfo?.installationAddress || 'Endereço não informado'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {onViewServiceOrder && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewServiceOrder(sale)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver OS
                          </Button>
                        )}
                        
                        {onMarkAsRemoved && (
                          <Button
                            size="sm"
                            onClick={() => onMarkAsRemoved(sale.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como Removida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remoções Próximas (7 dias) */}
      {upcomingRemovals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-800">Remoções Próximas (7 dias)</h3>
                <span className="text-xl font-bold text-amber-600">
                  {upcomingRemovals.length} {upcomingRemovals.length === 1 ? 'locação' : 'locações'}
                </span>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                Programe a equipe para as próximas remoções.
              </p>

              {/* Lista de remoções próximas */}
              <div className="space-y-2">
                {upcomingRemovals.map((sale) => (
                  <div 
                    key={sale.id} 
                    className="bg-white border border-amber-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{sale.customerName || 'Cliente não informado'}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{sale.productName}</span>
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                            OS #{sale.rentalInfo?.serviceOrderNumber}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-green-600" />
                            <span>Entrega: {sale.rentalInfo?.deliveryDate ? new Date(sale.rentalInfo.deliveryDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            {sale.rentalInfo?.deliveryTime && <span className="text-gray-500">às {sale.rentalInfo.deliveryTime}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-amber-600" />
                            <span className="font-semibold text-amber-600">
                              Remoção: {sale.rentalInfo?.removalDate ? new Date(sale.rentalInfo.removalDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 col-span-2">
                            <MapPin className="h-3 w-3" />
                            <span>{sale.rentalInfo?.installationAddress || 'Endereço não informado'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {onViewServiceOrder && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewServiceOrder(sale)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver OS
                          </Button>
                        )}
                        
                        {onMarkAsRemoved && (
                          <Button
                            size="sm"
                            onClick={() => onMarkAsRemoved(sale.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como Removida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
