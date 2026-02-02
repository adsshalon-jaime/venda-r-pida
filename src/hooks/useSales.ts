import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sale, ProductCategory, DashboardMetrics } from '@/types';
import { toast } from 'sonner';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedSales: Sale[] = (data || []).map((s) => ({
        id: s.id,
        productId: s.product_id || '',
        productName: s.product_name,
        category: s.category as ProductCategory,
        quantity: s.quantity || undefined,
        width: s.width ? Number(s.width) : undefined,
        length: s.length ? Number(s.length) : undefined,
        squareMeters: s.square_meters ? Number(s.square_meters) : undefined,
        totalValue: Number(s.total_value),
        customerId: s.customer_id || undefined,
        customerName: s.customer_name || undefined,
        saleDate: new Date(s.sale_date),
        isRental: s.is_rental || false,
        createdAt: new Date(s.created_at),
      }));

      setSales(mappedSales);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  }, []);

  const addSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          product_id: saleData.productId || null,
          product_name: saleData.productName,
          category: saleData.category,
          quantity: saleData.quantity || null,
          width: saleData.width || null,
          length: saleData.length || null,
          square_meters: saleData.squareMeters || null,
          total_value: saleData.totalValue,
          customer_id: saleData.customerId || null,
          customer_name: saleData.customerName || null,
          sale_date: saleData.saleDate.toISOString().split('T')[0],
          is_rental: saleData.isRental,
        })
        .select()
        .single();

      if (error) throw error;

      const newSale: Sale = {
        id: data.id,
        productId: data.product_id || '',
        productName: data.product_name,
        category: data.category as ProductCategory,
        quantity: data.quantity || undefined,
        width: data.width ? Number(data.width) : undefined,
        length: data.length ? Number(data.length) : undefined,
        squareMeters: data.square_meters ? Number(data.square_meters) : undefined,
        totalValue: Number(data.total_value),
        customerId: data.customer_id || undefined,
        customerName: data.customer_name || undefined,
        saleDate: new Date(data.sale_date),
        isRental: data.is_rental || false,
        createdAt: new Date(data.created_at),
      };

      setSales((prev) => [newSale, ...prev]);
      return newSale;
    } catch (error: any) {
      console.error('Error adding sale:', error);
      toast.error('Erro ao registrar venda');
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);

      if (error) throw error;

      setSales((prev) => prev.filter((s) => s.id !== id));
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast.error('Erro ao excluir venda');
      throw error;
    }
  };

  const getMetrics = useCallback((): DashboardMetrics => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthSales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthSales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
    });

    const monthlyRevenue = currentMonthSales.reduce((sum, s) => sum + s.totalValue, 0);
    const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + s.totalValue, 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const totalSquareMeters = currentMonthSales.reduce((sum, s) => sum + (s.squareMeters || 0), 0);
    const lastMonthSquareMeters = lastMonthSales.reduce((sum, s) => sum + (s.squareMeters || 0), 0);
    const squareMetersGrowth = lastMonthSquareMeters > 0
      ? ((totalSquareMeters - lastMonthSquareMeters) / lastMonthSquareMeters) * 100
      : 0;

    const lonasSold = currentMonthSales.filter((s) => s.category === 'lona').length;
    const tendasSold = currentMonthSales.filter((s) => s.category === 'tenda').length;

    return {
      monthlyRevenue,
      revenueGrowth,
      totalSquareMeters,
      squareMetersGrowth,
      totalSales: currentMonthSales.length,
      lonasSold,
      tendasSold,
    };
  }, [sales]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    addSale,
    deleteSale,
    getMetrics,
    refetch: fetchSales,
  };
}
