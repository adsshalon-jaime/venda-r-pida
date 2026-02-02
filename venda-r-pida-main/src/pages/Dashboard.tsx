import { useState } from 'react';
import { DollarSign, Ruler, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { ProductDistributionChart } from '@/components/ProductDistributionChart';
import { RecentSales } from '@/components/RecentSales';
import { NewSaleModal } from '@/components/NewSaleModal';
import { Layout } from '@/components/Layout';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types';

export default function Dashboard() {
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  const { sales, loading: salesLoading, addSale, getMetrics } = useSales();

  const metrics = getMetrics();
  const isLoading = productsLoading || customersLoading || salesLoading;

  const handleSaleComplete = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    await addSale(saleData);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do seu negócio
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Faturamento do Mês"
            value={`R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={metrics.revenueGrowth}
            icon={DollarSign}
            delay={0}
          />
          <MetricCard
            title="Metragem Vendida"
            value={`${metrics.totalSquareMeters.toFixed(2)} m²`}
            change={metrics.squareMetersGrowth}
            icon={Ruler}
            delay={100}
          />
          <MetricCard
            title="Total de Vendas"
            value={String(metrics.totalSales)}
            icon={ShoppingBag}
            delay={200}
          />
        </div>

        {/* Charts and Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductDistributionChart
            lonasSold={metrics.lonasSold}
            tendasSold={metrics.tendasSold}
          />
          <RecentSales sales={sales.slice(0, 5)} />
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
