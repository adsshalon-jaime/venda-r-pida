import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Pencil, Trash2, FileText, Package, Tent, Eye } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';
import { Key } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onView: (product: Product) => void;
  onExport: () => void;
}

export function ProductList({ products, onEdit, onDelete, onView, onExport }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
        <p className="text-muted-foreground mb-6">
          Comece cadastrando seus produtos de lonas e tendas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-background">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center border-2 border-background">
              <Tent className="h-4 w-4 text-chart-2" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Catálogo de Produtos</h2>
            <p className="text-xs text-muted-foreground">{products.length} produto(s)</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-muted/80 to-muted/40 hover:bg-muted/80">
              <TableHead className="font-semibold">Produto</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="text-right font-semibold">Preço Base</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow 
                key={product.id}
                className="animate-fade-in group hover:bg-muted/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      product.category === 'lona' 
                        ? 'bg-primary/10' 
                        : 'bg-chart-2/10'
                    )}>
                      {product.category === 'lona' ? (
                        <Package className="h-5 w-5 text-primary" />
                      ) : (
                        <Tent className="h-5 w-5 text-chart-2" />
                      )}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-medium",
                        product.category === 'lona'
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-chart-2/10 text-chart-2 hover:bg-chart-2/20'
                      )}
                    >
                      {product.category === 'lona' ? 'Lona' : 'Tenda'}
                    </Badge>
                    {product.isRental && (
                      <Badge
                        variant="outline"
                        className="font-medium text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                      >
                        <Key className="h-3 w-3" />
                        Locação
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-lg">
                    {formatCurrency(product.basePrice)}
                  </span>
                  {product.pricePerSquareMeter && (
                    <span className="text-muted-foreground text-sm ml-1">/m²</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onView(product)} className="gap-2">
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(product)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive gap-2"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O produto "{product.name}" será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(product.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
