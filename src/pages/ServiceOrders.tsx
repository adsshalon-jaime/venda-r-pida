import { useState } from 'react';
import { FileText, Eye, Printer, Calendar, MapPin, Search, Filter, CheckCircle, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { RemovalTracker } from '@/components/RemovalTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSales } from '@/hooks/useSales';
import { ServiceOrder } from '@/components/ServiceOrder';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';

export default function ServiceOrders() {
  const { sales, loading, markAsRemoved, deleteSale } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Filtrar apenas vendas de locação que têm OS
  const rentalSales = sales.filter(sale => 
    sale.isRental && sale.rentalInfo?.serviceOrderNumber
  );

  // Aplicar filtros
  const filteredSales = rentalSales.filter(sale => {
    const matchesSearch = 
      sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.rentalInfo?.serviceOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.productName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !sale.rentalInfo?.isRemoved) ||
      (statusFilter === 'completed' && sale.rentalInfo?.isRemoved);

    return matchesSearch && matchesStatus;
  });

  const handleViewOS = (sale: Sale) => {
    setSelectedSale(sale);
    setViewModalOpen(true);
  };

  const handleMarkAsCompleted = async (saleId: string) => {
    await markAsRemoved(saleId);
  };

  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (saleToDelete) {
      await deleteSale(saleToDelete.id);
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const getStatusBadge = (sale: Sale) => {
    if (sale.rentalInfo?.isRemoved) {
      return <Badge className="bg-green-600">Concluída</Badge>;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sale.rentalInfo?.removalDate) {
      const removalDate = new Date(sale.rentalInfo.removalDate);
      removalDate.setHours(0, 0, 0, 0);
      
      if (removalDate < today) {
        return <Badge className="bg-red-600">Atrasada</Badge>;
      }
      
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      if (removalDate <= nextWeek) {
        return <Badge className="bg-amber-600">Próxima</Badge>;
      }
    }

    return <Badge className="bg-blue-600">Pendente</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ordens de Serviço</h1>
            <p className="text-sm text-slate-600 mt-1">Gerencie as ordens de serviço de locação</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, OS ou produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredSales.length} {filteredSales.length === 1 ? 'ordem de serviço' : 'ordens de serviço'} encontrada{filteredSales.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Acompanhamento de Remoções */}
        <div className="mb-6">
          <RemovalTracker
            sales={sales}
            onMarkAsRemoved={markAsRemoved}
          />
        </div>

        {/* Lista de OS */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhuma OS encontrada</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'As ordens de serviço de locação aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">OS</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Cliente</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Produto</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Entrega</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Remoção</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Endereço</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-semibold text-blue-600">
                          #{sale.rentalInfo?.serviceOrderNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{sale.customerName}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700">{sale.productName}</div>
                        <div className="text-xs text-slate-500">{formatCurrency(sale.totalValue)}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-green-600" />
                          <span>
                            {sale.rentalInfo?.deliveryDate 
                              ? new Date(sale.rentalInfo.deliveryDate).toLocaleDateString('pt-BR')
                              : 'N/A'}
                          </span>
                        </div>
                        {sale.rentalInfo?.deliveryTime && (
                          <div className="text-xs text-slate-500">{sale.rentalInfo.deliveryTime}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-red-600" />
                          <span>
                            {sale.rentalInfo?.removalDate 
                              ? new Date(sale.rentalInfo.removalDate).toLocaleDateString('pt-BR')
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs text-slate-600 max-w-[200px]">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {sale.rentalInfo?.installationAddress || 'Não informado'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(sale)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewOS(sale)}
                            title="Visualizar OS"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!sale.rentalInfo?.isRemoved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleMarkAsCompleted(sale.id)}
                              title="Marcar como Concluída"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(sale)}
                            title="Excluir OS"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <ServiceOrder sale={selectedSale} />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a Ordem de Serviço <strong>#{saleToDelete?.rentalInfo?.serviceOrderNumber}</strong>?
                <br /><br />
                Esta ação não pode ser desfeita e removerá permanentemente:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>A ordem de serviço</li>
                  <li>O registro de locação</li>
                  <li>Todas as informações relacionadas</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
