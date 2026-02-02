import { useState } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Calendar, Download, Users, Package, DollarSign, TrendingUp, ShoppingBag, Key, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/Layout';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useReports } from '@/hooks/useReports';
import { Sale, Product, Customer } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ReportPeriod = 'day' | 'week' | 'month';

interface SalesStats {
  totalSales: number;
  totalValue: number;
  salesCount: number;
  rentalsCount: number;
  averageTicket: number;
}

interface ProductStats {
  totalProducts: number;
  rentalProducts: number;
  saleProducts: number;
  averagePrice: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisPeriod: number;
}

export default function Reports() {
  const { sales } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { reports, saveReport, deleteReport } = useReports();
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReportRef, setSalesReportRef] = useState<HTMLDivElement | null>(null);
  const [productsReportRef, setProductsReportRef] = useState<HTMLDivElement | null>(null);
  const [customersReportRef, setCustomersReportRef] = useState<HTMLDivElement | null>(null);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  const getFilteredSales = (): Sale[] => {
    let startDate: Date;
    let endDate: Date;

    if (useCustomDate && customStartDate && customEndDate) {
      startDate = startOfDay(new Date(customStartDate));
      endDate = endOfDay(new Date(customEndDate));
    } else {
      const now = new Date();
      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          endDate = endOfWeek(now, { weekStartsOn: 0 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        default:
          startDate = startOfDay(now);
          endDate = endOfDay(now);
      }
    }

    return sales.filter(sale => 
      isWithinInterval(new Date(sale.saleDate), { start: startDate, end: endDate })
    );
  };

  const getSalesStats = (filteredSales: Sale[]): SalesStats => {
    const totalSales = filteredSales.length;
    const totalValue = filteredSales.reduce((sum, sale) => sum + sale.totalValue, 0);
    const salesCount = filteredSales.filter(sale => !sale.isRental).length;
    const rentalsCount = filteredSales.filter(sale => sale.isRental).length;
    const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;

    return {
      totalSales,
      totalValue,
      salesCount,
      rentalsCount,
      averageTicket,
    };
  };

  const getProductStats = (): ProductStats => {
    const totalProducts = products.length;
    const rentalProducts = products.filter(p => p.isRental).length;
    const saleProducts = totalProducts - rentalProducts;
    const averagePrice = totalProducts > 0 
      ? products.reduce((sum, p) => sum + p.basePrice, 0) / totalProducts 
      : 0;

    return {
      totalProducts,
      rentalProducts,
      saleProducts,
      averagePrice,
    };
  };

  const getCustomerStats = (): CustomerStats => {
    const totalCustomers = customers.length;
    const filteredSales = getFilteredSales();
    const activeCustomers = new Set(filteredSales.map(s => s.customerId).filter(Boolean)).size;
    const newCustomersThisPeriod = customers.filter(c => {
      const customerSales = sales.filter(s => s.customerId === c.id);
      if (customerSales.length === 0) return false;
      
      const firstSaleDate = new Date(Math.min(...customerSales.map(s => new Date(s.saleDate).getTime())));
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        default:
          startDate = startOfDay(now);
      }

      return isWithinInterval(firstSaleDate, { start: startDate, end: now });
    }).length;

    return {
      totalCustomers,
      activeCustomers,
      newCustomersThisPeriod,
    };
  };

  const generatePDF = async (ref: HTMLDivElement | null, fileName: string) => {
    if (!ref) {
      toast.error('Erro ao gerar relatório');
      return;
    }

    try {
      toast.loading('Gerando PDF...');
      
      const canvas = await html2canvas(ref, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(fileName);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const getPeriodLabel = () => {
    if (useCustomDate && customStartDate && customEndDate) {
      return `${format(new Date(customStartDate), 'dd/MM/yyyy')} - ${format(new Date(customEndDate), 'dd/MM/yyyy')}`;
    }
    
    const now = new Date();
    switch (period) {
      case 'day':
        return format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
        return `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM/yyyy")}`;
      case 'month':
        return format(now, "MMMM 'de' yyyy", { locale: ptBR });
      default:
        return '';
    }
  };

  const saveCurrentReport = async () => {
    const startDate = useCustomDate && customStartDate ? new Date(customStartDate) : 
      period === 'day' ? startOfDay(new Date()) :
      period === 'week' ? startOfWeek(new Date(), { weekStartsOn: 0 }) :
      startOfMonth(new Date());
    
    const endDate = useCustomDate && customEndDate ? new Date(customEndDate) :
      period === 'day' ? endOfDay(new Date()) :
      period === 'week' ? endOfWeek(new Date(), { weekStartsOn: 0 }) :
      endOfMonth(new Date());

    const reportData = {
      title: `Relatório ${activeTab === 'sales' ? 'de Vendas' : activeTab === 'products' ? 'de Produtos' : 'de Clientes'} - ${getPeriodLabel()}`,
      type: activeTab as 'sales' | 'products' | 'customers',
      startDate,
      endDate,
      data: activeTab === 'sales' ? salesStats : activeTab === 'products' ? productStats : customerStats,
    };

    await saveReport(reportData);
    toast.success('Relatório salvo com sucesso!');
  };

  const filteredSales = getFilteredSales();
  const salesStats = getSalesStats(filteredSales);
  const productStats = getProductStats();
  const customerStats = getCustomerStats();

  const ReportHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-8 border-b pb-6">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
          <FileText className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tendas e Carpas</h1>
      <p className="text-gray-600 mb-4">{title}</p>
      <div className="flex justify-center gap-6 text-sm text-gray-500">
        <span>📞 (63) 98502-8838</span>
        <span>📧 contato@tendascarpas.ind.br</span>
      </div>
    </div>
  );

  const PeriodInfo = () => (
    <div className="mb-6 text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Período: {getPeriodLabel()}
      </h2>
      <p className="text-gray-600">
        Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
      </p>
    </div>
  );

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Gere relatórios detalhados de vendas, produtos e clientes
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCustomDate"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useCustomDate" className="text-sm">Datas personalizadas</Label>
            </div>
            
            {useCustomDate ? (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            ) : (
              <Select value={period} onValueChange={(value: ReportPeriod) => setPeriod(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Operações</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesStats.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  {salesStats.salesCount} vendas e {salesStats.rentalsCount} locações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesStats.totalValue)}</div>
                <p className="text-xs text-muted-foreground">Período: {getPeriodLabel()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesStats.averageTicket)}</div>
                <p className="text-xs text-muted-foreground">Por operação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Locação</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesStats.totalSales > 0 ? Math.round((salesStats.rentalsCount / salesStats.totalSales) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesStats.rentalsCount} de {salesStats.totalSales}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={saveCurrentReport} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
            <Button onClick={() => generatePDF(salesReportRef, `relatorio-vendas-${format(new Date(), 'dd-MM-yyyy')}.pdf`)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Vendas
            </Button>
          </div>

          <div ref={setSalesReportRef} className="bg-white p-8 rounded-lg">
            <ReportHeader title="Relatório de Vendas e Locações" />
            <PeriodInfo />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{salesStats.totalSales}</div>
                <div className="text-sm text-gray-600">Total Operações</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(salesStats.totalValue)}</div>
                <div className="text-sm text-gray-600">Faturamento</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(salesStats.averageTicket)}</div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {salesStats.totalSales > 0 ? Math.round((salesStats.rentalsCount / salesStats.totalSales) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taxa Locação</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Produto</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Cliente</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {format(new Date(sale.saleDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {sale.productName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {sale.customerName || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {sale.isRental ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Locação
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Venda
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">
                        {formatCurrency(sale.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              <p>© 2026 Tendas e Carpas - Todos os direitos reservados</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productStats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Para Venda</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productStats.saleProducts}</div>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Para Locação</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productStats.rentalProducts}</div>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(productStats.averagePrice)}</div>
                <p className="text-xs text-muted-foreground">Por produto</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={saveCurrentReport} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
            <Button onClick={() => generatePDF(productsReportRef, `relatorio-produtos-${format(new Date(), 'dd-MM-yyyy')}.pdf`)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Produtos
            </Button>
          </div>

          <div ref={setProductsReportRef} className="bg-white p-8 rounded-lg">
            <ReportHeader title="Relatório de Produtos" />
            <PeriodInfo />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{productStats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Produtos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{productStats.saleProducts}</div>
                <div className="text-sm text-gray-600">Para Venda</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{productStats.rentalProducts}</div>
                <div className="text-sm text-gray-600">Para Locação</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(productStats.averagePrice)}</div>
                <div className="text-sm text-gray-600">Preço Médio</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Categoria</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Preço Base</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        <Badge variant={product.category === 'lona' ? 'default' : 'secondary'}>
                          {product.category === 'lona' ? 'Lona' : 'Tenda'}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.isRental ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Locação
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Venda
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">
                        {formatCurrency(product.basePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              <p>© 2026 Tendas e Carpas - Todos os direitos reservados</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground">No período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.newCustomersThisPeriod}</div>
                <p className="text-xs text-muted-foreground">No período</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={saveCurrentReport} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
            <Button onClick={() => generatePDF(customersReportRef, `relatorio-clientes-${format(new Date(), 'dd-MM-yyyy')}.pdf`)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Clientes
            </Button>
          </div>

          <div ref={setCustomersReportRef} className="bg-white p-8 rounded-lg">
            <ReportHeader title="Relatório de Clientes" />
            <PeriodInfo />
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customerStats.totalCustomers}</div>
                <div className="text-sm text-gray-600">Total Clientes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customerStats.activeCustomers}</div>
                <div className="text-sm text-gray-600">Clientes Ativos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customerStats.newCustomersThisPeriod}</div>
                <div className="text-sm text-gray-600">Novos Clientes</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Telefone</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Total Compras</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => {
                    const customerSales = sales.filter(s => s.customerId === customer.id);
                    const totalSpent = customerSales.reduce((sum, s) => sum + s.totalValue, 0);
                    
                    return (
                      <tr key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {customer.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {customer.email || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {customer.phone || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {customerSales.length} compras ({formatCurrency(totalSpent)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              <p>© 2026 Tendas e Carpas - Todos os direitos reservados</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
}
