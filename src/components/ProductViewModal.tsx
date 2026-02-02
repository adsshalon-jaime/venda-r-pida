import { Package, Tent, DollarSign, Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';

interface ProductViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductViewModal({ open, onOpenChange, product }: ProductViewModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                {product.category === 'lona' ? (
                  <Package className="h-6 w-6 text-primary" />
                ) : (
                  <Tent className="h-6 w-6 text-chart-2" />
                )}
              </div>
              Detalhes do Produto
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Name and Category */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <Badge
                variant="secondary"
                className={cn(
                  "font-medium px-3 py-1",
                  product.category === 'lona'
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-chart-2/10 text-chart-2 hover:bg-chart-2/20'
                )}
              >
                {product.category === 'lona' ? 'Lona' : 'Tenda'}
              </Badge>
            </div>
          </div>

          {/* Price Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary">Preço Base</h3>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(product.basePrice)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {product.pricePerSquareMeter ? 'por metro quadrado' : 'unitário'}
              </p>
            </div>

            {product.category === 'lona' && (
              <div className="p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-5 w-5 text-chart-2" />
                  <h3 className="font-semibold text-chart-2">Metragem Padrão</h3>
                </div>
                <p className="text-2xl font-bold text-chart-2">
                  {product.standardMeterage.toFixed(2)} m²
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Metragem de referência
                </p>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações Adicionais</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Tipo de Preço</span>
                <Badge variant="outline">
                  {product.pricePerSquareMeter ? 'Por m²' : 'Unitário'}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Categoria</span>
                <Badge variant="outline">
                  {product.category === 'lona' ? 'Lona' : 'Tenda'}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">ID do Produto</span>
                <span className="font-mono text-sm">{product.id}</span>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          {product.category === 'lona' && product.pricePerSquareMeter && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20">
              <h4 className="font-semibold mb-3">Exemplo de Cálculo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Medida: 6m × 10m = 60m²</span>
                  <span className="font-medium">60m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço por m²:</span>
                  <span className="font-medium">{formatCurrency(product.basePrice)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(product.basePrice * 60)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
