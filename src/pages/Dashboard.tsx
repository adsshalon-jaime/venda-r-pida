import { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, Ruler, ShoppingBag, Plus, Users, Package, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { ProductDistributionChart } from '@/components/ProductDistributionChart';
import { RecentSales } from '@/components/RecentSales';
import { NewSaleModal } from '@/components/NewSaleModal';
import { OverdueAlert } from '@/components/OverdueAlert';
import { RentalAlert } from '@/components/RentalAlert';
import { ServiceOrder } from '@/components/ServiceOrder';
import { MonthSelector } from '@/components/MonthSelector';
import { Layout } from '@/components/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';

export default function Dashboard() {
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [serviceOrderModalOpen, setServiceOrderModalOpen] = useState(false);
  const [selectedSaleForOS, setSelectedSaleForOS] = useState<Sale | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  const { sales, loading: salesLoading, addSale, getMonthlyMetrics, getSalesByMonth, getMonthName, getPreviousMonth, calculateGrowth, getCreditSalesMetrics, markSaleAsPaid, getOverdueSales, getPendingRemovals, markAsRemoved } = useSales();

  const currentMonthMetrics = getMonthlyMetrics(selectedMonth);
  const previousMonth = getPreviousMonth(selectedMonth);
  const previousMonthMetrics = getMonthlyMetrics(previousMonth);
  const creditMetrics = getCreditSalesMetrics();
  
  const isLoading = productsLoading || customersLoading || salesLoading;

  const handleSaleComplete = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    await addSale(saleData);
  };

  const handleViewServiceOrder = (sale: Sale) => {
    setSelectedSaleForOS(sale);
    setServiceOrderModalOpen(true);
  };

  const handleMarkAsRemoved = async (saleId: string) => {
    await markAsRemoved(saleId);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        {/* Header com design moderno */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Visão geral do seu negócio em tempo real
            </p>
          </div>
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={setSelectedMonth} 
          />
        </div>

        {/* Metrics Grid - Cards principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title={`Faturamento de ${getMonthName(selectedMonth)}`}
            value={formatCurrency(currentMonthMetrics.monthlyRevenue)}
            change={calculateGrowth(currentMonthMetrics.monthlyRevenue, previousMonthMetrics.monthlyRevenue)}
            icon={DollarSign}
            gradient="from-emerald-50 to-teal-50/50"
            iconColor="text-emerald-600"
            delay={0}
          />
          <MetricCard
            title={`Vendas de ${getMonthName(selectedMonth)}`}
            value={String(currentMonthMetrics.totalSales)}
            change={calculateGrowth(currentMonthMetrics.totalSales, previousMonthMetrics.totalSales)}
            icon={ShoppingBag}
            gradient="from-blue-50 to-indigo-50/50"
            iconColor="text-blue-600"
            delay={100}
          />
          <MetricCard
            title="Produtos Cadastrados"
            value={String(products.length)}
            icon={Package}
            gradient="from-violet-50 to-purple-50/50"
            iconColor="text-violet-600"
            delay={200}
          />
          <MetricCard
            title="Comparativo Mensal"
            value={formatCurrency(previousMonthMetrics.monthlyRevenue)}
            change={calculateGrowth(previousMonthMetrics.monthlyRevenue, currentMonthMetrics.monthlyRevenue)}
            icon={TrendingUp}
            gradient="from-amber-50 to-orange-50/50"
            iconColor="text-amber-600"
            delay={300}
          />
        </div>

        {/* Credit Sales Metrics - Cards de vendas a prazo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Vendas a Prazo"
            value={formatCurrency(creditMetrics.totalCreditSales)}
            change={creditMetrics.creditSalesCount}
            icon={Calendar}
            gradient="from-sky-50 to-cyan-50/50"
            iconColor="text-sky-600"
            delay={400}
          />
          <MetricCard
            title="Contas Vencidas"
            value={formatCurrency(creditMetrics.totalOverdue)}
            change={creditMetrics.overdueCount > 0 ? -creditMetrics.overdueCount : 0}
            icon={AlertCircle}
            gradient="from-rose-50 to-pink-50/50"
            iconColor="text-rose-600"
            delay={500}
          />
          <MetricCard
            title="A Vencer (7 dias)"
            value={formatCurrency(creditMetrics.totalDueSoon)}
            change={creditMetrics.dueSoonCount}
            icon={TrendingUp}
            gradient="from-amber-50 to-yellow-50/50"
            iconColor="text-amber-600"
            delay={600}
          />
        </div>

        {/* Overdue Alerts */}
        <OverdueAlert
          totalOverdue={creditMetrics.totalOverdue}
          overdueCount={creditMetrics.overdueCount}
          totalDueSoon={creditMetrics.totalDueSoon}
          dueSoonCount={creditMetrics.dueSoonCount}
          overdueSales={getOverdueSales()}
          onMarkAsPaid={markSaleAsPaid}
        />

        {/* Rental Alerts - Alertas de Locação */}
        <RentalAlert
          pendingRemovals={getPendingRemovals()}
          onViewServiceOrder={handleViewServiceOrder}
          onMarkAsRemoved={handleMarkAsRemoved}
        />

        {/* Charts and Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <ProductDistributionChart
            lonasSold={currentMonthMetrics.lonasSold}
            tendasSold={currentMonthMetrics.tendasSold}
          />
          <RecentSales 
            sales={getSalesByMonth(selectedMonth).slice(0, 5)} 
            showMonthBadge={true}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>

      {/* Floating Action Button - Modernizado e Responsivo */}
      <Button
        size="icon-lg"
        variant="floating"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-2 border-white/20 hover:scale-110 transition-all duration-300 animate-pulse-glow z-50"
        onClick={() => setSaleModalOpen(true)}
        disabled={isLoading}
      >
        <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
      </Button>

      <NewSaleModal
        open={saleModalOpen}
        onOpenChange={setSaleModalOpen}
        products={products}
        customers={customers}
        onSaleComplete={handleSaleComplete}
      />

      {/* Modal de Ordem de Serviço */}
      <Dialog open={serviceOrderModalOpen} onOpenChange={setServiceOrderModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {selectedSaleForOS && (
            <ServiceOrder sale={selectedSaleForOS} />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
