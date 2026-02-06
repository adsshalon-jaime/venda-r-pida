import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Check, ChevronsUpDown, User, X, Calculator, Key, CreditCard, DollarSign, Smartphone, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, Customer, Sale, PaymentMethod, PaymentInfo } from '@/types';
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
  const [saleType, setSaleType] = useState<'sale' | 'rental'>('sale');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Estados para pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [entryValueDisplay, entryValueValue, updateEntryValue, setEntryValueValue] = useCurrencyInput(0);
  const [installments, setInstallments] = useState<number>(1);
  const [dueDate, setDueDate] = useState<string>(''); // Data de vencimento para fiado

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (saleType === 'rental') {
        return product.isRental;
      }
      return true; // Para venda, mostra todos os produtos
    });
  }, [products, saleType]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const calculatedValue = useMemo(() => {
    if (!selectedProduct) return 0;

    // Para lonas, usa o preço base diretamente sem cálculo de área
    if (selectedProduct.category === 'lona') {
      return selectedProduct.basePrice;
    } else {
      return quantity * selectedProduct.basePrice;
    }
  }, [selectedProduct, quantity]);

  const finalValue = customValueValue > 0 ? customValueValue : calculatedValue;

  useEffect(() => {
    if (!open) {
      setSelectedProductId('');
      setQuantity(1);
      setWidth(0);
      setLength(0);
      setCustomValueValue(0);
      setShowCustomerSearch(false);
      setSelectedCustomerId('');
      setSaleType('sale');
      setSaleDate(new Date().toISOString().split('T')[0]);
      // Resetar campos de pagamento
      setPaymentMethod('dinheiro');
      setEntryValueValue(0);
      setInstallments(1);
      setDueDate('');
    }
  }, [open, setCustomValueValue, setEntryValueValue]);

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    if (selectedProduct.category === 'tenda' && quantity <= 0) {
      toast.error('Informe a quantidade');
      return;
    }

    // Validações para pagamento com cartão
    if (paymentMethod === 'cartao') {
      if (entryValueValue > finalValue) {
        toast.error('Valor da entrada não pode ser maior que o valor total');
        return;
      }
      if (entryValueValue > 0 && installments <= 1) {
        toast.error('Se houver entrada, informe o número de parcelas');
        return;
      }
    }

    // Validações para pagamento fiado
    if (paymentMethod === 'fiado') {
      if (!selectedCustomer) {
        toast.error('Para venda a prazo, é necessário selecionar um cliente');
        return;
      }
      if (!dueDate) {
        toast.error('Para venda a prazo, é necessário informar a data de vencimento');
        return;
      }
      
      const dueDateObj = new Date(dueDate);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 30);
      
      if (dueDateObj > maxDate) {
        toast.error('Data de vencimento não pode ser superior a 30 dias');
        return;
      }
      
      if (dueDateObj < today) {
        toast.error('Data de vencimento não pode ser anterior a hoje');
        return;
      }
    }

    // Criar informações de pagamento
    const paymentInfo: PaymentInfo | undefined = paymentMethod === 'cartao' ? {
      method: paymentMethod,
      entryValue: entryValueValue > 0 ? entryValueValue : undefined,
      installments: installments > 1 ? installments : undefined,
    } : paymentMethod === 'fiado' ? {
      method: paymentMethod,
      dueDate: new Date(dueDate + 'T00:00:00'),
    } : {
      method: paymentMethod,
    };

    const sale: Omit<Sale, 'id' | 'createdAt'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: selectedProduct.category === 'tenda' ? quantity : undefined,
      width: undefined,
      length: undefined,
      squareMeters: undefined,
      totalValue: finalValue,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      saleDate: new Date(saleDate + 'T00:00:00'),
      isRental: saleType === 'rental',
      paymentInfo,
    };

    onSaleComplete(sale);
    onOpenChange(false);
    toast.success(saleType === 'rental' ? 'Locação registrada com sucesso!' : 'Venda registrada com sucesso!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {saleType === 'rental' ? 'Nova Locação' : 'Nova Venda'}
          </DialogTitle>
          <DialogDescription>
            {saleType === 'rental' 
              ? 'Registre uma nova locação de produto' 
              : 'Registre uma nova venda de produto'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sale Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Operação</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSaleType('sale');
                  setSelectedProductId('');
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  saleType === 'sale'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <Calculator className={`h-6 w-6 ${saleType === 'sale' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-semibold ${saleType === 'sale' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Venda e Locação
                </span>
                {saleType === 'sale' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaleType('rental');
                  setSelectedProductId('');
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  saleType === 'rental'
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10'
                    : 'border-border hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <Key className={`h-6 w-6 ${saleType === 'rental' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                <span className={`font-semibold ${saleType === 'rental' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  Locação
                </span>
                {saleType === 'rental' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder={`Selecione um produto ${saleType === 'rental' ? 'para locação' : ''}`} />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {saleType === 'rental' 
                      ? 'Nenhum produto disponível para locação' 
                      : 'Nenhum produto encontrado'
                    }
                  </div>
                ) : (
                  <>
                    <div className="px-2 pb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Lonas
                      </p>
                      {filteredProducts
                        .filter((p) => p.category === 'lona')
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              <span>{product.name}</span>
                              {product.isRental && (
                                <Key className="h-3 w-3 text-amber-600" />
                              )}
                            </div>
                            <span className="text-muted-foreground"> - {formatCurrency(product.basePrice)}/m²</span>
                          </SelectItem>
                        ))}
                    </div>
                    <div className="px-2 pb-2 border-t pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Tendas
                      </p>
                      {filteredProducts
                        .filter((p) => p.category === 'tenda')
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              <span>{product.name}</span>
                              {product.isRental && (
                                <Key className="h-3 w-3 text-amber-600" />
                              )}
                            </div>
                            <span className="text-muted-foreground"> - {formatCurrency(product.basePrice)}</span>
                          </SelectItem>
                        ))}
                    </div>
                    <div className="px-2 pb-2 border-t pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Ferragens
                      </p>
                      {filteredProducts
                        .filter((p) => p.category === 'ferragem')
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              <span>{product.name}</span>
                              {product.isRental && (
                                <Key className="h-3 w-3 text-amber-600" />
                              )}
                            </div>
                            <span className="text-muted-foreground"> - {formatCurrency(product.basePrice)} (kit)</span>
                          </SelectItem>
                        ))}
                    </div>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Date */}
          <div className="space-y-2">
            <Label className="text-sm">Data da {saleType === 'rental' ? 'Locação' : 'Venda'}</Label>
            <Input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="h-9"
            />
          </div>

          {/* Dynamic Fields based on product type */}
          {selectedProduct && (
            <div className="space-y-4 animate-fade-in">
              {selectedProduct.category === 'lona' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                    <Calculator className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Produto: {selectedProduct.name}
                    </span>
                  </div>
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
                <Label className="text-sm">Valor da Venda</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    R$
                  </span>
                  <Input
                    value={customValueDisplay}
                    onChange={(e) => updateCustomValue(e.target.value)}
                    placeholder="R$ 0,00"
                    className="pl-10 pr-20 h-9"
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
                className="w-full justify-start h-10"
                onClick={() => setShowCustomerSearch(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Puxar Cliente
              </Button>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Cliente</Label>
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
                      className="w-full justify-between h-10"
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

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-sm">Método de Pagamento</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('dinheiro');
                  setEntryValueValue(0);
                  setInstallments(1);
                  setDueDate('');
                }}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all text-xs',
                  paymentMethod === 'dinheiro'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <DollarSign className="h-4 w-4 mb-1" />
                <span className="font-medium">Dinheiro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('pix');
                  setEntryValueValue(0);
                  setInstallments(1);
                  setDueDate('');
                }}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all text-xs',
                  paymentMethod === 'pix'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <Smartphone className="h-4 w-4 mb-1" />
                <span className="font-medium">Pix</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cartao');
                  setDueDate('');
                }}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all text-xs',
                  paymentMethod === 'cartao'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <CreditCard className="h-4 w-4 mb-1" />
                <span className="font-medium">Cartão</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('fiado');
                  setEntryValueValue(0);
                  setInstallments(1);
                }}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all text-xs',
                  paymentMethod === 'fiado'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <Calendar className="h-4 w-4 mb-1" />
                <span className="font-medium">Venda a Prazo</span>
              </button>
            </div>

            {/* Cartão Payment Options */}
            {paymentMethod === 'cartao' && (
              <div className="space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Valor da Entrada (opcional)</Label>
                    <Input
                      value={entryValueDisplay}
                      onChange={(e) => updateEntryValue(e.target.value)}
                      placeholder="R$ 0,00"
                      className="font-mono h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Parcelas</Label>
                    <Select
                      value={installments.toString()}
                      onValueChange={(value) => setInstallments(parseInt(value))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">À vista</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="3">3x</SelectItem>
                        <SelectItem value="4">4x</SelectItem>
                        <SelectItem value="5">5x</SelectItem>
                        <SelectItem value="6">6x</SelectItem>
                        <SelectItem value="7">7x</SelectItem>
                        <SelectItem value="8">8x</SelectItem>
                        <SelectItem value="9">9x</SelectItem>
                        <SelectItem value="10">10x</SelectItem>
                        <SelectItem value="11">11x</SelectItem>
                        <SelectItem value="12">12x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Summary */}
                {(entryValueValue > 0 || installments > 1) && (
                  <div className="bg-muted/50 rounded-lg p-2 space-y-1">
                    {entryValueValue > 0 && (
                      <div className="flex justify-between text-xs">
                        <span>Entrada:</span>
                        <span className="font-medium">{formatCurrency(entryValueValue)}</span>
                      </div>
                    )}
                    {installments > 1 && (
                      <div className="flex justify-between text-xs">
                        <span>Saldo parcelado:</span>
                        <span className="font-medium">
                          {formatCurrency(finalValue - entryValueValue)}
                        </span>
                      </div>
                    )}
                    {installments > 1 && (
                      <div className="flex justify-between text-xs">
                        <span>Valor da parcela:</span>
                        <span className="font-medium text-primary">
                          {formatCurrency((finalValue - entryValueValue) / installments)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fiado Payment Options */}
            {paymentMethod === 'fiado' && (
              <div className="space-y-2 animate-fade-in">
                <div className="space-y-1">
                  <Label className="text-xs">Data de Vencimento (até 30 dias)</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="h-9"
                  />
                </div>

                {/* Fiado Summary */}
                {dueDate && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-amber-800">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Venda a Prazo</span>
                    </div>
                    <div className="flex justify-between text-xs text-amber-700">
                      <span>Valor a receber:</span>
                      <span className="font-medium">{formatCurrency(finalValue)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-amber-700">
                      <span>Vencimento:</span>
                      <span className="font-medium">
                        {new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-amber-700">
                      <span>Dias restantes:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(dueDate + 'T00:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                      </span>
                    </div>
                  </div>
                )}

                {!selectedCustomer && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <div className="flex items-center gap-2 text-xs text-red-800">
                      <User className="h-3 w-3" />
                      <span className="font-medium">Atenção: Selecione um cliente</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Para venda a prazo, é necessário selecionar um cliente acima.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleSubmit}
              disabled={!selectedProduct || finalValue <= 0}
            >
              {saleType === 'rental' ? 'Registrar Locação' : 'Registrar Venda'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
