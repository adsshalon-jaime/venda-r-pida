import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Search, Calendar, Trash2, ShoppingBag, Eye, Edit, Key } from 'lucide-react';
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
  const { sales, loading: salesLoading, addSale, deleteSale } = useSales();
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const isLoading = productsLoading || customersLoading || salesLoading;

  const filteredSales = sales.filter(
    (sale) =>
      sale.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (sale: Sale) => {
    setEditingSale(sale);
    setViewModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    // TODO: Implementar edição de venda
    toast.info('Funcionalidade de edição em desenvolvimento');
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
          <Button onClick={() => setSaleModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
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
            <p>Nenhuma venda registrada</p>
            <Button variant="outline" className="mt-4" onClick={() => setSaleModalOpen(true)}>
              Registrar primeira venda
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
                  <TableHead className="text-right">Valor</TableHead>
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{sale.productName}</p>
                          {sale.isRental && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                            >
                              <Key className="h-3 w-3" />
                              Locação
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs mt-1",
                            sale.category === 'lona'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-chart-2/10 text-chart-2'
                          )}
                        >
                          {sale.category === 'lona' ? 'Lona' : 'Tenda'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sale.customerName || (
                        <span className="text-muted-foreground">Venda Direta</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {sale.squareMeters && (
                        <span>
                          {sale.width}m × {sale.length}m = {sale.squareMeters.toFixed(1)} m²
                        </span>
                      )}
                      {sale.quantity && <span>{sale.quantity}x unidade(s)</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-success">
                        {formatCurrency(sale.totalValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleView(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
