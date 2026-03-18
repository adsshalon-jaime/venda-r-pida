import { useState, useEffect } from 'react';
import { Truck, AlertTriangle, Eye } from 'lucide-react';
import { Sale } from '@/types';
import { RemovalCountdown } from './RemovalCountdown';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ServiceOrder } from './ServiceOrder';

interface RemovalTrackerProps {
  sales: Sale[];
  onMarkAsRemoved?: (saleId: string) => void;
}

export function RemovalTracker({ sales, onMarkAsRemoved }: RemovalTrackerProps) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [expiredNotified, setExpiredNotified] = useState<Set<string>>(new Set());

  // Filtrar apenas locações ativas (não removidas)
  const activeRentals = sales.filter(sale => 
    sale.isRental && 
    sale.rentalInfo?.removalDate && 
    !sale.rentalInfo?.isRemoved
  );

  // Separar por status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredRentals = activeRentals.filter(sale => {
    const removalDate = new Date(sale.rentalInfo!.removalDate);
    removalDate.setHours(0, 0, 0, 0);
    return removalDate < today;
  });

  const todayRentals = activeRentals.filter(sale => {
    const removalDate = new Date(sale.rentalInfo!.removalDate);
    removalDate.setHours(0, 0, 0, 0);
    return removalDate.getTime() === today.getTime();
  });

  const urgentRentals = activeRentals.filter(sale => {
    const removalDate = new Date(sale.rentalInfo!.removalDate);
    removalDate.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((removalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 2;
  });

  const upcomingRentals = activeRentals.filter(sale => {
    const removalDate = new Date(sale.rentalInfo!.removalDate);
    removalDate.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((removalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 2 && daysRemaining <= 7;
  });

  // Notificar sobre serviços expirados
  useEffect(() => {
    expiredRentals.forEach(sale => {
      if (!expiredNotified.has(sale.id)) {
        // Criar notificação sonora e visual
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Remoção Atrasada!', {
            body: `A locação de ${sale.customerName} está atrasada! OS #${sale.rentalInfo?.serviceOrderNumber}`,
            icon: '/logo.png',
            tag: sale.id,
          });
        }
        
        setExpiredNotified(prev => new Set(prev).add(sale.id));
      }
    });
  }, [expiredRentals, expiredNotified]);

  // Solicitar permissão de notificação ao montar o componente
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setViewModalOpen(true);
  };

  // Se não há locações ativas, mostrar mensagem informativa
  if (activeRentals.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-slate-100 rounded-full p-3">
            <Truck className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 text-lg">Nenhuma Locação Pendente</h3>
            <p className="text-sm text-slate-500 mt-1">
              Quando você criar uma locação de tenda, o acompanhamento de remoção aparecerá aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Remoções Expiradas */}
      {expiredRentals.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 animate-fade-in shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-100 rounded-full p-2 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-red-800 text-lg">🚨 Remoções EXPIRADAS</h3>
                <span className="text-2xl font-bold text-red-600">
                  {expiredRentals.length}
                </span>
              </div>
              <p className="text-sm text-red-700 font-semibold">
                ATENÇÃO! Estas locações estão com a data de remoção vencida. Providencie a remoção imediatamente!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expiredRentals.map(sale => (
              <RemovalCountdown 
                key={sale.id} 
                sale={sale} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Remoções para Hoje */}
      {todayRentals.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 animate-fade-in shadow-md">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-100 rounded-full p-2">
              <Truck className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-red-800 text-lg">📅 Remoções para HOJE</h3>
                <span className="text-2xl font-bold text-red-600">
                  {todayRentals.length}
                </span>
              </div>
              <p className="text-sm text-red-700">
                Estas locações devem ser removidas hoje!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayRentals.map(sale => (
              <RemovalCountdown 
                key={sale.id} 
                sale={sale} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Remoções Urgentes (1-2 dias) */}
      {urgentRentals.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-orange-800">⚡ Remoções Urgentes (1-2 dias)</h3>
                <span className="text-xl font-bold text-orange-600">
                  {urgentRentals.length}
                </span>
              </div>
              <p className="text-sm text-orange-700">
                Prepare a equipe para as remoções dos próximos dias.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentRentals.map(sale => (
              <RemovalCountdown 
                key={sale.id} 
                sale={sale} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Remoções Próximas (3-7 dias) */}
      {upcomingRentals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-amber-100 rounded-full p-2">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-800">📋 Remoções Próximas (3-7 dias)</h3>
                <span className="text-xl font-bold text-amber-600">
                  {upcomingRentals.length}
                </span>
              </div>
              <p className="text-sm text-amber-700">
                Planeje a logística para estas remoções.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingRentals.map(sale => (
              <RemovalCountdown 
                key={sale.id} 
                sale={sale} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de Visualização da OS */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div>
              <ServiceOrder sale={selectedSale} />
              {onMarkAsRemoved && !selectedSale.rentalInfo?.isRemoved && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      onMarkAsRemoved(selectedSale.id);
                      setViewModalOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Marcar como Removida
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
