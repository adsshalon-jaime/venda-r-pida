import { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, Ruler, ShoppingBag, Plus, Users, Package, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { ProductDistributionChart } from '@/components/ProductDistributionChart';
import { RecentSales } from '@/components/RecentSales';
import { NewSaleModal } from '@/components/NewSaleModal';
import { OverdueAlert } from '@/components/OverdueAlert';
import { MonthSelector } from '@/components/MonthSelector';
import { Layout } from '@/components/Layout';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';

export default function Dashboard() {
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  const { sales, loading: salesLoading, addSale, getMonthlyMetrics, getSalesByMonth, getMonthName, getPreviousMonth, calculateGrowth, getCreditSalesMetrics } = useSales();

  const currentMonthMetrics = getMonthlyMetrics(selectedMonth);
  const previousMonth = getPreviousMonth(selectedMonth);
  const previousMonthMetrics = getMonthlyMetrics(previousMonth);
  const creditMetrics = getCreditSalesMetrics();
  
  const isLoading = productsLoading || customersLoading || salesLoading;

  const handleSaleComplete = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    await addSale(saleData);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visão geral do seu negócio
            </p>
          </div>
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={setSelectedMonth} 
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={`Faturamento de ${getMonthName(selectedMonth)}`}
            value={formatCurrency(currentMonthMetrics.monthlyRevenue)}
            change={calculateGrowth(currentMonthMetrics.monthlyRevenue, previousMonthMetrics.monthlyRevenue)}
            icon={DollarSign}
            delay={0}
          />
          <MetricCard
            title={`Vendas de ${getMonthName(selectedMonth)}`}
            value={String(currentMonthMetrics.totalSales)}
            change={calculateGrowth(currentMonthMetrics.totalSales, previousMonthMetrics.totalSales)}
            icon={ShoppingBag}
            delay={100}
          />
          <MetricCard
            title="Produtos Cadastrados"
            value={String(products.length)}
            icon={Package}
            delay={200}
          />
          <MetricCard
            title="Comparativo Mensal"
            value={formatCurrency(previousMonthMetrics.monthlyRevenue)}
            change={calculateGrowth(previousMonthMetrics.monthlyRevenue, currentMonthMetrics.monthlyRevenue)}
            icon={TrendingUp}
            delay={300}
          />
        </div>

        {/* Credit Sales Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Vendas a Prazo"
            value={formatCurrency(creditMetrics.totalCreditSales)}
            change={creditMetrics.creditSalesCount}
            icon={Calendar}
            delay={400}
          />
          <MetricCard
            title="Contas Vencidas"
            value={formatCurrency(creditMetrics.totalOverdue)}
            change={creditMetrics.overdueCount > 0 ? -creditMetrics.overdueCount : 0}
            icon={AlertCircle}
            delay={500}
          />
          <MetricCard
            title="A Vencer (7 dias)"
            value={formatCurrency(creditMetrics.totalDueSoon)}
            change={creditMetrics.dueSoonCount}
            icon={TrendingUp}
            delay={600}
          />
        </div>

        {/* Overdue Alerts */}
        <OverdueAlert
          totalOverdue={creditMetrics.totalOverdue}
          overdueCount={creditMetrics.overdueCount}
          totalDueSoon={creditMetrics.totalDueSoon}
          dueSoonCount={creditMetrics.dueSoonCount}
        />

        {/* Charts and Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Floating Action Button */}
      <Button
        size="icon-lg"
        variant="floating"
        className="floating-action animate-pulse-glow"
        onClick={() => setSaleModalOpen(true)}
        disabled={isLoading}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NewSaleModal
        open={saleModalOpen}
        onOpenChange={setSaleModalOpen}
        products={products}
        customers={customers}
        onSaleComplete={handleSaleComplete}
      />
    </Layout>
  );
}
