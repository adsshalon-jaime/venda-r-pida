import { useState, useEffect } from 'react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { Plus, Trash2, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RentalContractDocument } from './RentalContractDocument';
import { Customer } from '@/types';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

interface RentalItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RentalContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
}

export function RentalContractModal({ open, onOpenChange, customers }: RentalContractModalProps) {
  const { settings } = useSettings();
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<RentalItem[]>([
    { name: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [rentalPeriod, setRentalPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [rentalDuration, setRentalDuration] = useState(1);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [shippingFee, setShippingFee] = useState(0);
  const [assemblyFee, setAssemblyFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [pixKey, setPixKey] = useState('');

  const calculateEndDate = () => {
    const start = new Date(startDate);
    switch (rentalPeriod) {
      case 'day':
        return addDays(start, rentalDuration);
      case 'week':
        return addWeeks(start, rentalDuration);
      case 'month':
        return addMonths(start, rentalDuration);
      default:
        return start;
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingFee + assemblyFee;
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof RentalItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const handleGenerateContract = () => {
    if (!selectedCustomer) {
      toast.error('Selecione um cliente');
      return;
    }

    if (items.some((item) => !item.name || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Preencha todos os itens corretamente');
      return;
    }

    if (paymentMethod === 'pix' && !pixKey) {
      toast.error('Informe a chave PIX');
      return;
    }

    setStep('preview');
  };

  const handlePrint = () => {
    window.print();
  };

  const contract = selectedCustomer && settings
    ? {
        contractNumber: `LC-${format(new Date(), 'yyyyMMddHHmmss')}`,
        contractDate: new Date(),
        companyData: {
          name: settings.company_name || 'Coberturas Shalon',
          cnpj: settings.cnpj || 'Não informado',
          address: 'Palmas - TO',
          phone: settings.phone || 'Não informado',
          email: 'contato@coberturasshalon.com.br',
        },
        customerName: selectedCustomer.name,
        customerDocument: selectedCustomer.cpfCnpj || 'Não informado',
        customerAddress: selectedCustomer.address 
          ? `${selectedCustomer.address.street}, ${selectedCustomer.address.number} - ${selectedCustomer.address.neighborhood}`
          : 'Não informado',
        customerCity: selectedCustomer.address?.city || 'Não informado',
        customerState: selectedCustomer.address?.state || 'Não informado',
        customerPhone: selectedCustomer.phone || 'Não informado',
        customerReference: undefined,
        items,
        rentalPeriod,
        rentalDuration,
        startDate: new Date(startDate),
        endDate: calculateEndDate(),
        subtotal: calculateSubtotal(),
        shippingFee,
        assemblyFee,
        totalValue: calculateTotal(),
        paymentMethod,
        pixKey: paymentMethod === 'pix' ? pixKey : undefined,
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            {step === 'form' ? 'Novo Contrato de Locação' : 'Visualizar Contrato'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-6">
            {/* Seleção de Cliente */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <Label className="text-base font-semibold mb-3 block">Cliente</Label>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período de Locação */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label className="text-base font-semibold mb-3 block">Período de Locação</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de Locação</Label>
                  <Select
                    value={rentalPeriod}
                    onValueChange={(value: any) => setRentalPeriod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Diária</SelectItem>
                      <SelectItem value="week">Semanal</SelectItem>
                      <SelectItem value="month">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duração</Label>
                  <Input
                    type="number"
                    min="1"
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Itens da Locação */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Itens da Locação</Label>
                <Button size="sm" onClick={handleAddItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        placeholder="Ex: Tenda 3x3"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Valor Unit.</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input value={item.total.toFixed(2)} disabled />
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valores Adicionais */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Label className="text-base font-semibold mb-3 block">Valores Adicionais</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Taxa de Frete</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Taxa de Montagem</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={assemblyFee}
                    onChange={(e) => setAssemblyFee(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <Label className="text-base font-semibold mb-3 block">Forma de Pagamento</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Método de Pagamento</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: any) => setPaymentMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === 'pix' && (
                  <div>
                    <Label>Chave PIX</Label>
                    <Input
                      placeholder="Digite a chave PIX"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>VALOR TOTAL:</span>
                <span className="text-2xl text-primary">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateContract}>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Contrato
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="print:hidden flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep('form')}>
                Voltar
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Contrato
              </Button>
            </div>
            {contract && <RentalContractDocument contract={contract} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
