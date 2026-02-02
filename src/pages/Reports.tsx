import { useState } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ReportPeriod = 'day' | 'week' | 'month';

interface ReportStats {
  totalSales: number;
  totalValue: number;
  salesCount: number;
  rentalsCount: number;
  averageTicket: number;
}

export default function Reports() {
  const { sales } = useSales();
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [reportContentRef, setReportContentRef] = useState<HTMLDivElement | null>(null);

  const getFilteredSales = (): Sale[] => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

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

    return sales.filter(sale => 
      isWithinInterval(new Date(sale.saleDate), { start: startDate, end: endDate })
    );
  };

  const getReportStats = (filteredSales: Sale[]): ReportStats => {
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

  const generatePDF = async () => {
    if (!reportContentRef) {
      toast.error('Erro ao gerar relatório');
      return;
    }

    try {
      toast.loading('Gerando PDF...');
      
      const canvas = await html2canvas(reportContentRef, {
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

      const periodText = period === 'day' ? 'Dia' : period === 'week' ? 'Semana' : 'Mês';
      const fileName = `relatorio-${periodText.toLowerCase()}-${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      
      pdf.save(fileName);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const filteredSales = getFilteredSales();
  const stats = getReportStats(filteredSales);

  const getPeriodLabel = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios detalhados de vendas e locações
          </p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Operações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {stats.salesCount} vendas e {stats.rentalsCount} locações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Período: {getPeriodLabel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageTicket)}</div>
            <p className="text-xs text-muted-foreground">
              Valor médio por operação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Locação</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSales > 0 ? Math.round((stats.rentalsCount / stats.totalSales) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.rentalsCount} de {stats.totalSales} operações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content (for PDF export) */}
      <div ref={setReportContentRef} className="bg-white p-8 rounded-lg">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tendas e Carpas</h1>
          <p className="text-gray-600 mb-4">Relatório de Vendas e Locações</p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>📞 (63) 98502-8838</span>
            <span>📧 contato@tendascarpas.ind.br</span>
          </div>
        </div>

        {/* Period Info */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Período: {getPeriodLabel()}
          </h2>
          <p className="text-gray-600">
            Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalSales}</div>
            <div className="text-sm text-gray-600">Total Operações</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-600">Faturamento</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageTicket)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalSales > 0 ? Math.round((stats.rentalsCount / stats.totalSales) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Taxa Locação</div>
          </div>
        </div>

        {/* Sales Table */}
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

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>© 2026 Tendas e Carpas - Todos os direitos reservados</p>
          <p className="mt-1">Relatório gerado automaticamente pelo sistema</p>
        </div>
      </div>
    </div>
  );
}
