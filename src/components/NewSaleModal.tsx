import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, User, X, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, Customer, Sale } from '@/types';
import { toast } from 'sonner';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';
import { formatCurrency } from '@/utils/currency';

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  customers: Customer[];
  onSaleComplete: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
}

export function NewSaleModal({
  open,
  onOpenChange,
  products,
  customers,
  onSaleComplete,
}: NewSaleModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [width, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [customValueDisplay, customValueValue, updateCustomValue, setCustomValueValue] = useCurrencyInput(0);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const calculatedValue = useMemo(() => {
    if (!selectedProduct) return 0;

    if (selectedProduct.category === 'lona') {
      const squareMeters = width * length;
      return squareMeters * selectedProduct.basePrice;
    } else {
      return quantity * selectedProduct.basePrice;
    }
  }, [selectedProduct, width, length, quantity]);

  const finalValue = customValueValue > 0 ? customValueValue : calculatedValue;
  const squareMeters = selectedProduct?.category === 'lona' ? width * length : 0;

  useEffect(() => {
    if (!open) {
      setSelectedProductId('');
      setQuantity(1);
      setWidth(0);
      setLength(0);
      setCustomValueValue(0);
      setShowCustomerSearch(false);
      setSelectedCustomerId('');
    }
  }, [open, setCustomValueValue]);

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    if (selectedProduct.category === 'lona' && (width <= 0 || length <= 0)) {
      toast.error('Informe as medidas da lona');
      return;
    }

    if (selectedProduct.category === 'tenda' && quantity <= 0) {
      toast.error('Informe a quantidade');
      return;
    }

    const sale: Omit<Sale, 'id' | 'createdAt'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: selectedProduct.category === 'tenda' ? quantity : undefined,
      width: selectedProduct.category === 'lona' ? width : undefined,
      length: selectedProduct.category === 'lona' ? length : undefined,
      squareMeters: selectedProduct.category === 'lona' ? squareMeters : undefined,
      totalValue: finalValue,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
    };

    onSaleComplete(sale);
    onOpenChange(false);
    toast.success('Venda registrada com sucesso!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nova Venda</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Lonas
                  </p>
                  {products
                    .filter((p) => p.category === 'lona')
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.basePrice)}/m²
                      </SelectItem>
                    ))}
                </div>
                <div className="px-2 pb-2 border-t pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tendas
                  </p>
                  {products
                    .filter((p) => p.category === 'tenda')
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.basePrice)}
                      </SelectItem>
                    ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Fields based on product type */}
          {selectedProduct && (
            <div className="space-y-4 animate-fade-in">
              {selectedProduct.category === 'lona' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Largura (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={width || ''}
                        onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Comprimento (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={length || ''}
                        onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {squareMeters > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                      <Calculator className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Área total: {squareMeters.toFixed(2)} m²
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {/* Value Field */}
              <div className="space-y-2">
                <Label>Valor da Venda</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    R$
                  </span>
                  <Input
                    value={customValueDisplay}
                    onChange={(e) => updateCustomValue(e.target.value)}
                    placeholder="R$ 0,00"
                    className="pl-10 pr-20"
                  />
                  {customValueValue > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-xs"
                      onClick={() => setCustomValueValue(0)}
                    >
                      Resetar
                    </Button>
                  )}
                </div>
                {calculatedValue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Valor calculado: {formatCurrency(calculatedValue)}
                    {customValueValue > 0 && ` (desconto de ${formatCurrency(calculatedValue - customValueValue)})`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Customer Selection */}
          <div className="space-y-2">
            {!showCustomerSearch ? (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowCustomerSearch(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Puxar Cliente
              </Button>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <Label>Cliente</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCustomerSearch(false);
                      setSelectedCustomerId('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedCustomer?.name || 'Buscar cliente...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar por nome..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedCustomerId(customer.id);
                                setCustomerSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedCustomerId === customer.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {customer.phone || customer.email}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedProduct || finalValue <= 0}
            >
              Registrar Venda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
