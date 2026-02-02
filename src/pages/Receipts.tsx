import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, User, Search, Calendar, DollarSign, Package, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/Layout';
import { useSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';
import { Sale, Customer } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CheckedState } from '@radix-ui/react-checkbox';

export default function Receipts() {
  const { sales } = useSales();
  const { customers } = useCustomers();
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [includeCustomerData, setIncludeCustomerData] = useState(true);
  const [receiptRef, setReceiptRef] = useState<HTMLDivElement | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  const selectedSale = sales.find(sale => sale.id === selectedSaleId);
  const selectedCustomer = selectedSale?.customerId 
    ? customers.find(c => c.id === selectedSale.customerId)
    : null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setCompanyLogo(result as string);
        setLogoPreview(result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateReceiptPDF = async () => {
    if (!selectedSale || !receiptRef) {
      toast.error('Selecione uma venda para gerar o recibo');
      return;
    }

    try {
      toast.loading('Gerando recibo...', { id: 'receipt-loading' });
      
      const canvas = await html2canvas(receiptRef, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Centralizar o recibo na página
      const x = 0;
      const y = (pageHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      const fileName = `recibo-${selectedSale.productName.replace(/\s+/g, '-')}-${format(new Date(selectedSale.saleDate), 'dd-MM-yyyy')}.pdf`;
      pdf.save(fileName);
      
      toast.success('Recibo gerado com sucesso!', { id: 'receipt-loading' });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Erro ao gerar recibo', { id: 'receipt-loading' });
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recibos</h1>
            <p className="text-muted-foreground">
              Gere recibos profissionais para suas vendas e locações
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de seleção */}
          <Card>
            <CardHeader>
              <CardTitle>Gerar Recibo</CardTitle>
              <CardDescription>
                Selecione a venda e configure as opções do recibo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sale-select">Selecionar Venda</Label>
                <Select value={selectedSaleId} onValueChange={setSelectedSaleId}>
                  <SelectTrigger id="sale-select">
                    <SelectValue placeholder="Selecione uma venda" />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.map((sale) => (
                      <SelectItem key={sale.id} value={sale.id}>
                        {sale.productName} - {format(new Date(sale.saleDate), 'dd/MM/yyyy')} - {formatCurrency(sale.totalValue)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-customer"
                  checked={includeCustomerData}
                  onCheckedChange={(checked: CheckedState) => setIncludeCustomerData(checked === true)}
                />
                <Label htmlFor="include-customer" className="text-sm">
                  Incluir dados completos do cliente
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo da Empresa (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {logoPreview && (
                    <div className="w-12 h-12 border rounded-lg overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={generateReceiptPDF}
                disabled={!selectedSale}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Recibo PDF
              </Button>
            </CardContent>
          </Card>

          {/* Informações da venda selecionada */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSale ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Produto</Label>
                      <p className="font-medium">{selectedSale.productName}</p>
                    </div>
                    <div>
                      <Label>Data da Venda</Label>
                      <p className="font-medium">{format(new Date(selectedSale.saleDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="font-medium">
                        {selectedSale.isRental ? 'Locação' : 'Venda'}
                      </p>
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <p className="font-medium text-lg">{formatCurrency(selectedSale.totalValue)}</p>
                    </div>
                  </div>

                  {selectedCustomer && (
                    <div className="border-t pt-4">
                      <Label>Cliente</Label>
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">{selectedCustomer.name}</p>
                        {selectedCustomer.email && (
                          <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                        )}
                        {selectedCustomer.phone && (
                          <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSale.quantity && (
                    <div className="border-t pt-4">
                      <Label>Detalhes</Label>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Quantidade: {selectedSale.quantity}</p>
                        {selectedSale.width && selectedSale.length && (
                          <p className="text-sm">
                            Medidas: {selectedSale.width}m × {selectedSale.length}m
                            {selectedSale.squareMeters && ` (${selectedSale.squareMeters}m²)`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma venda para visualizar as informações</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview do Recibo */}
        {selectedSale && (
          <Card>
            <CardHeader>
              <CardTitle>Preview do Recibo</CardTitle>
              <CardDescription>
                Este é o modelo do recibo que será gerado em PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={setReceiptRef}
                className="bg-white p-8 rounded-lg border"
                style={{ width: '210mm', minHeight: '297mm' }}
              >
                {/* Cabeçalho */}
                <div className="text-center mb-8 border-b pb-6">
                  <div className="flex justify-center mb-4">
                    {companyLogo ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img src={companyLogo} alt="Logo da empresa" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img src="/logo-recibo.png" alt="Tendas Carpa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <h1 className="text-lg font-semibold text-gray-800 mb-2">Tendas Carpa</h1>
                  <p className="text-xs text-gray-600 mb-4">RECIBO DE {selectedSale.isRental ? 'LOCAÇÃO' : 'VENDA'}</p>
                  <div className="flex justify-center gap-6 text-xs text-gray-500">
                    <span>📞 (63) 98502-8838</span>
                    <span>📧 contato@tendascarpas.ind.br</span>
                  </div>
                </div>

                {/* Número do recibo */}
                <div className="mb-6 text-center">
                  <p className="text-xs text-gray-500">Nº {selectedSale.id.slice(-8).toUpperCase()}</p>
                </div>

                {/* Informações da venda */}
                <div className="mb-8">
                  <h2 className="text-sm font-medium text-gray-700 mb-4">Dados da Transação</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Data:</span>
                      <span className="text-xs font-medium">{format(new Date(selectedSale.saleDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Tipo:</span>
                      <span className="text-xs font-medium">{selectedSale.isRental ? 'Locação' : 'Venda'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Produto:</span>
                      <span className="text-xs font-medium">{selectedSale.productName}</span>
                    </div>
                    {selectedSale.quantity && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Quantidade:</span>
                        <span className="text-xs font-medium">{selectedSale.quantity}</span>
                      </div>
                    )}
                    {selectedSale.width && selectedSale.length && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Medidas:</span>
                        <span className="text-xs font-medium">{selectedSale.width}m × {selectedSale.length}m</span>
                      </div>
                    )}
                    {selectedSale.squareMeters && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Área:</span>
                        <span className="text-xs font-medium">{selectedSale.squareMeters}m²</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados do cliente */}
                {includeCustomerData && selectedCustomer && (
                  <div className="mb-8">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">Dados do Cliente</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Nome:</span>
                        <span className="text-xs font-medium">{selectedCustomer.name}</span>
                      </div>
                      {selectedCustomer.email && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Email:</span>
                          <span className="text-xs font-medium">{selectedCustomer.email}</span>
                        </div>
                      )}
                      {selectedCustomer.phone && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Telefone:</span>
                          <span className="text-xs font-medium">{selectedCustomer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Valor */}
                <div className="mb-8 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">VALOR TOTAL:</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(selectedSale.totalValue)}</span>
                  </div>
                </div>

                {/* Assinatura */}
                <div className="mt-16 pt-8">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="border-b-2 border-gray-300 pb-2">
                        <p className="text-xs text-gray-500">Assinatura do Vendedor</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé */}
                <div className="mt-8 text-center text-xs text-gray-500">
                  <p className="text-xs text-gray-500">
                    Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
