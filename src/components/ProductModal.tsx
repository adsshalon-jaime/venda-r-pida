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
import { Package, Tent, Wrench } from 'lucide-react';
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
  const [isRental, setIsRental] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setBasePrice(product.basePrice);
      setPricePerSquareMeter(product.pricePerSquareMeter);
      setIsRental(product.isRental || false);
    } else {
      setName('');
      setCategory('lona');
      setBasePrice(0);
      setPricePerSquareMeter(true);
      setIsRental(false);
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
      isRental,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {category === 'lona' ? (
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              ) : category === 'tenda' ? (
                <div className="p-1.5 rounded-lg bg-chart-2/10">
                  <Tent className="h-5 w-5 text-chart-2" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-orange-100">
                  <Wrench className="h-5 w-5 text-orange-600" />
                </div>
              )}
              {product ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-4 pt-0">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('lona');
                  setPricePerSquareMeter(true);
                }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200 ${
                  category === 'lona'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <Package className={`h-6 w-6 ${category === 'lona' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${category === 'lona' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Lona
                </span>
                {category === 'lona' && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('tenda');
                  setPricePerSquareMeter(false);
                }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200 ${
                  category === 'tenda'
                    ? 'border-chart-2 bg-chart-2/5 shadow-lg shadow-chart-2/10'
                    : 'border-border hover:border-chart-2/30 hover:bg-muted/50'
                }`}
              >
                <Tent className={`h-6 w-6 ${category === 'tenda' ? 'text-chart-2' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${category === 'tenda' ? 'text-chart-2' : 'text-muted-foreground'}`}>
                  Tenda
                </span>
                {category === 'tenda' && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-chart-2 rounded-full animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('ferragem');
                  setPricePerSquareMeter(false);
                }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200 ${
                  category === 'ferragem'
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-200'
                    : 'border-border hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                <Wrench className={`h-6 w-6 ${category === 'ferragem' ? 'text-orange-600' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${category === 'ferragem' ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  Ferragem
                </span>
                {category === 'ferragem' && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
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
              placeholder={category === 'lona' ? 'Ex: Lona PVC Térmica' : category === 'tenda' ? 'Ex: Tenda Piramidal 3x3m' : 'Ex: Kit de Ferragens para Tenda'}
              className="h-10 text-base"
            />
          </div>

          {/* Base Price */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Preço Base {category === 'lona' && pricePerSquareMeter ? '(por m²)' : category === 'ferragem' ? '(do kit)' : '(unitário)'}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                R$
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={basePrice || ''}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="h-10 text-base pl-10"
              />
            </div>
          </div>

          {/* Price per m² toggle - only for lonas */}
          {category === 'lona' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
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

          {/* Ferragem info - only for ferragem */}
          {category === 'ferragem' && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-800">
                <Wrench className="h-3.5 w-3.5" />
                <span className="font-medium text-sm">Ferragens para Tendas</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Kits completos com todas as ferragens necessárias para montagem e manutenção de tendas.
              </p>
              <div className="mt-2 space-y-0.5 text-xs text-orange-600">
                <p>• Inclui: parafusos, porcas, arruelas</p>
                <p>• Inclui: ferragens de fixação</p>
                <p>• Inclui: ferragens de ajuste</p>
              </div>
            </div>
          )}

          {/* Rental toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
            <div className="space-y-0.5">
              <Label htmlFor="is-rental" className="cursor-pointer font-medium">
                Produto para Locação
              </Label>
              <p className="text-xs text-muted-foreground">
                Marcar como produto disponível para aluguel
              </p>
            </div>
            <Switch
              id="is-rental"
              checked={isRental}
              onCheckedChange={setIsRental}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 h-10 font-semibold"
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
