import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Product, ProductCategory } from '@/types';
import { toast } from 'sonner';
import { Package, Tent } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}

export function ProductModal({ open, onOpenChange, product, onSave }: ProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('lona');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [pricePerSquareMeter, setPricePerSquareMeter] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setBasePrice(product.basePrice);
      setPricePerSquareMeter(product.pricePerSquareMeter);
    } else {
      setName('');
      setCategory('lona');
      setBasePrice(0);
      setPricePerSquareMeter(true);
    }
  }, [product, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Informe o nome do produto');
      return;
    }

    if (basePrice <= 0) {
      toast.error('Informe um preço válido');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      standardMeterage: 0,
      basePrice,
      pricePerSquareMeter: category === 'lona' ? pricePerSquareMeter : false,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {category === 'lona' ? (
                <div className="p-2 rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-chart-2/10">
                  <Tent className="h-6 w-6 text-chart-2" />
                </div>
              )}
              {product ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6 pt-2">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categoria</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCategory('lona');
                  setPricePerSquareMeter(true);
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  category === 'lona'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <Package className={`h-8 w-8 ${category === 'lona' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-semibold ${category === 'lona' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Lona
                </span>
                {category === 'lona' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('tenda');
                  setPricePerSquareMeter(false);
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  category === 'tenda'
                    ? 'border-chart-2 bg-chart-2/5 shadow-lg shadow-chart-2/10'
                    : 'border-border hover:border-chart-2/30 hover:bg-muted/50'
                }`}
              >
                <Tent className={`h-8 w-8 ${category === 'tenda' ? 'text-chart-2' : 'text-muted-foreground'}`} />
                <span className={`font-semibold ${category === 'tenda' ? 'text-chart-2' : 'text-muted-foreground'}`}>
                  Tenda
                </span>
                {category === 'tenda' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-chart-2 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome do Produto</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={category === 'lona' ? 'Ex: Lona PVC Térmica' : 'Ex: Tenda Piramidal 3x3m'}
              className="h-12 text-base"
            />
          </div>

          {/* Base Price */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Preço Base {category === 'lona' && pricePerSquareMeter ? '(por m²)' : '(unitário)'}
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                R$
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={basePrice || ''}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="h-12 text-base pl-12"
              />
            </div>
          </div>

          {/* Price per m² toggle - only for lonas */}
          {category === 'lona' && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="price-per-m2" className="cursor-pointer font-medium">
                  Preço por m²
                </Label>
                <p className="text-xs text-muted-foreground">
                  Calcular valor da venda por metragem
                </p>
              </div>
              <Switch
                id="price-per-m2"
                checked={pricePerSquareMeter}
                onCheckedChange={setPricePerSquareMeter}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 h-12 font-semibold"
              onClick={handleSubmit}
            >
              {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
