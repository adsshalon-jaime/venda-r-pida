import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Quote, QuoteItem, Customer, QuotePaymentMethod } from '@/types';
import { Plus, Trash2, User, MapPin, Truck, Calendar, FileText, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface EditQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  customers: Customer[];
  onQuoteUpdate: (quoteId: string, quoteData: Partial<Quote>) => Promise<void>;
}

export function EditQuoteModal({ open, onOpenChange, quote, customers, onQuoteUpdate }: EditQuoteModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [validityDays, setValidityDays] = useState(15);
  const [paymentMethod, setPaymentMethod] = useState<QuotePaymentMethod>('pix');
  const [installments, setInstallments] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && quote) {
      const customer = customers.find((c) => c.id === quote.customerId);
      setSelectedCustomer(customer || null);
      setItems(quote.items);
      setDeliveryAddress(quote.deliveryAddress);
      setDeliveryDeadline(quote.deliveryDeadline);
      setShippingCost(quote.shippingCost);
      setPaymentMethod(quote.paymentInfo.method);
      setInstallments(quote.paymentInfo.installments || 1);
      setNotes(quote.notes || '');

      const daysUntilValid = Math.ceil(
        (new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      setValidityDays(daysUntilValid > 0 ? daysUntilValid : 15);
    }
  }, [open, quote, customers]);

  useEffect(() => {
    if (selectedCustomer) {
      if (selectedCustomer.address) {
        const addr = selectedCustomer.address;
        setDeliveryAddress(
          `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city} - ${addr.state}`
        );
      }
    }
  }, [selectedCustomer]);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingCost;
  };

  const handleSubmit = async () => {
    if (!quote) return;

    if (!selectedCustomer) {
      toast.error('Selecione um cliente');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um item ao orçamento');
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      toast.error('Preencha a descrição de todos os itens');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Informe o endereço de entrega');
      return;
    }

    if (!deliveryDeadline.trim()) {
      toast.error('Informe o prazo de entrega');
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const updatedData: Partial<Quote> = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email || undefined,
      customerPhone: selectedCustomer.phone || undefined,
      items,
      subtotal: calculateSubtotal(),
      shippingCost,
      total: calculateTotal(),
      deliveryAddress,
      deliveryDeadline,
      validUntil,
      paymentInfo: {
        method: paymentMethod,
        installments: paymentMethod === 'cartao' ? installments : undefined,
      },
      notes: notes || undefined,
    };

    await onQuoteUpdate(quote.id, updatedData);
    onOpenChange(false);
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Editar Orçamento - {quote.quoteNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-slate-600" />
              <Label className="text-base font-semibold">Selecionar Cliente</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cliente Cadastrado *</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find((c) => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Nome:</span>{' '}
                    <span className="text-slate-900">{selectedCustomer.name}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <span className="font-semibold text-slate-700">E-mail:</span>{' '}
                      <span className="text-slate-900">{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.phone && (
                    <div>
                      <span className="font-semibold text-slate-700">Telefone:</span>{' '}
                      <span className="text-slate-900">{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Itens do Orçamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens do Orçamento</Label>
              <Button onClick={addItem} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-sm text-slate-500">Nenhum item adicionado</p>
                <p className="text-xs text-slate-400 mt-1">Clique em "Adicionar Item" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 p-3 bg-white border border-slate-200 rounded-lg"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descrição do serviço/produto"
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 1)}
                        placeholder="Qtd"
                        className="h-9 text-center"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value) || 0)}
                        placeholder="R$ 0,00"
                        className="h-9 text-right"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <Input
                        type="text"
                        value={`R$ ${item.total.toFixed(2)}`}
                        readOnly
                        className="h-9 bg-slate-100 font-semibold text-right cursor-not-allowed"
                        title="Calculado automaticamente (Qtd × Valor Unit.)"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totais */}
          {items.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">R$ {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Frete:</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="h-8 w-32 text-right"
                />
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span className="text-emerald-600">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Forma de Pagamento */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-slate-600" />
              <Label className="text-base font-semibold">Forma de Pagamento</Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Método de Pagamento *</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value as QuotePaymentMethod);
                    if (e.target.value !== 'cartao') {
                      setInstallments(1);
                    }
                  }}
                >
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência Bancária</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="cartao">Cartão de Crédito</option>
                </select>
              </div>

              {paymentMethod === 'cartao' && (
                <div className="space-y-2">
                  <Label className="text-xs">Número de Parcelas</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        {num}x de R$ {(calculateTotal() / num).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço de Entrega *
              </Label>
              <Textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Prazo de Entrega *
              </Label>
              <Input
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                placeholder="Ex: 5 dias úteis"
                className="h-9"
              />
              <Label className="text-sm flex items-center gap-2 mt-3">
                <Calendar className="h-4 w-4" />
                Validade do Orçamento (dias)
              </Label>
              <Input
                type="number"
                min="1"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="h-9"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-sm">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais, condições de pagamento, etc."
              className="min-h-[100px]"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
