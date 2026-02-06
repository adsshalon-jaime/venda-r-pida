import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Search, Calendar, Trash2, ShoppingBag, Eye, Edit, Key, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { NewSaleModal } from '@/components/NewSaleModal';
import { EditSaleModal } from '@/components/EditSaleModal';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

export default function Sales() {
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  const { sales, loading: salesLoading, addSale, deleteSale, updateSale } = useSales();
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleType, setSaleType] = useState<'all' | 'sale' | 'rental'>('all');

  const isLoading = productsLoading || customersLoading || salesLoading;

  const filteredSales = sales.filter(
    (sale) => {
      const matchesSearch = sale.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = saleType === 'all' || 
        (saleType === 'sale' && !sale.isRental) ||
        (saleType === 'rental' && sale.isRental);
      
      return matchesSearch && matchesType;
    }
  );

  const handleView = (sale: Sale) => {
    setEditingSale(sale);
    setViewModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditModalOpen(true);
  };

  const handleUpdate = async (updatedSale: Sale) => {
    try {
      await updateSale(updatedSale.id, updatedSale);
      toast.success(updatedSale.isRental ? 'Locação atualizada com sucesso!' : 'Venda atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  const handleSaleComplete = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    await addSale(saleData);
  };

  const handleDelete = async (saleId: string) => {
    try {
      await deleteSale(saleId);
      toast.success('Venda excluída');
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground mt-1">
              Histórico completo de vendas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setSaleModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
            
            {/* Filtro por tipo */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Tipo:</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSaleType('all')}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    saleType === 'all' 
                      ? 'bg-primary text-primary border-primary' 
                      : 'border-muted hover:border-primary/50 hover:bg-primary/50'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType('sale')}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    saleType === 'sale' 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'border-muted hover:border-green-600/50 hover:bg-green-50'
                  }`}
                >
                  Vendas
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType('rental')}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    saleType === 'rental' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-muted hover:border-blue-600/50 hover:bg-blue-50'
                  }`}
                >
                  Locações
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sales Table */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold mb-2">
              {saleType === 'all' && 'Nenhuma venda registrada'}
              {saleType === 'sale' && 'Nenhuma venda registrada'}
              {saleType === 'rental' && 'Nenhuma locação registrada'}
            </p>
            <p className="text-sm text-muted-foreground">
              {saleType === 'all' && 'Registre sua primeira venda'}
              {saleType === 'sale' && 'Registre sua primeira venda'}
              {saleType === 'rental' && 'Registre sua primeira locação'}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setSaleModalOpen(true)}>
              {saleType === 'sale' && 'Registrar primeira venda'}
              {saleType === 'rental' && 'Registrar primeira locação'}
              {saleType === 'all' && 'Registrar primeira venda'}
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale, index) => (
                  <TableRow
                    key={sale.id}
                    className="animate-fade-in group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(sale.saleDate), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.productName}</p>
                        {sale.isRental && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                          >
                            <Key className="h-3 w-3" />
                            Locação
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs mt-1",
                            sale.category === 'lona'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : sale.category === 'tenda'
                              ? 'bg-chart-2/10 text-chart-2 border-chart-2/20'
                              : 'bg-orange-100 text-orange-600 border-orange-200'
                          )}
                        >
                          {sale.category === 'lona' ? 'Lona' : sale.category === 'tenda' ? 'Tenda' : 'Ferragem'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sale.customerName || (
                        <span className="text-muted-foreground">Venda Direta</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-lg">{formatCurrency(sale.totalValue)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Eye
                          className="h-4 w-4 cursor-pointer hover:text-primary"
                          onClick={() => handleView(sale)}
                        />
                        <Edit
                          className="h-4 w-4 cursor-pointer hover:text-primary ml-2"
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEdit(sale)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir {sale.isRental ? 'locação' : 'venda'}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A {sale.isRental ? 'locação' : 'venda'} será removida permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sale.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <NewSaleModal
          open={saleModalOpen}
          onOpenChange={setSaleModalOpen}
          products={products}
          customers={customers}
          onSaleComplete={handleSaleComplete}
        />

        {/* Edit Sale Modal */}
        <EditSaleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          sale={editingSale}
          products={products}
          customers={customers}
          onUpdate={handleUpdate}
        />

        {/* Sale View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingSale?.isRental ? (
                  <>
                    <Key className="h-5 w-5 text-amber-600" />
                    Detalhes da Locação
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Detalhes da Venda
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {editingSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Data</Label>
                    <p className="font-medium">
                      {format(new Date(editingSale.saleDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tipo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {editingSale.isRental ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                          <Key className="h-3 w-3 mr-1" />
                          Locação
                        </Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary">
                          Venda
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Produto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">{editingSale.productName}</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        editingSale.category === 'lona'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-chart-2/10 text-chart-2'
                      )}
                    >
                      {editingSale.category === 'lona' ? 'Lona' : 'Tenda'}
                    </Badge>
                  </div>
                </div>

                {editingSale.customerName && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Cliente</Label>
                    <p className="font-medium">{editingSale.customerName}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-muted-foreground">Detalhes</Label>
                  <p className="text-sm text-muted-foreground">
                    {editingSale.squareMeters && (
                      <span>{editingSale.width}m × {editingSale.length}m = {editingSale.squareMeters.toFixed(1)} m²</span>
                    )}
                    {editingSale.quantity && <span>{editingSale.quantity}x unidade(s)</span>}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Valor Total</Label>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(editingSale.totalValue)}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
