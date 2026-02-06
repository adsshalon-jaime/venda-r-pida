import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

      const mappedSales: Sale[] = (data || []).map((s: any) => ({
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
        saleDate: new Date(s.sale_date + 'T00:00:00'),
        isRental: s.is_rental || false,
        createdAt: new Date(s.created_at),
        paymentInfo: s.payment_method ? {
          method: s.payment_method,
          entryValue: s.payment_entry_value ? Number(s.payment_entry_value) : undefined,
          installments: s.payment_installments ? Number(s.payment_installments) : undefined,
          dueDate: s.payment_due_date ? new Date(s.payment_due_date + 'T00:00:00') : undefined,
        } : undefined,
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
          payment_method: saleData.paymentInfo?.method || null,
          payment_entry_value: saleData.paymentInfo?.entryValue || null,
          payment_installments: saleData.paymentInfo?.installments || null,
          payment_due_date: saleData.paymentInfo?.dueDate?.toISOString().split('T')[0] || null,
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
        saleDate: new Date(data.sale_date + 'T00:00:00'),
        isRental: data.is_rental || false,
        createdAt: new Date(data.created_at),
        paymentInfo: (data as any).payment_method ? {
          method: (data as any).payment_method,
          entryValue: (data as any).payment_entry_value ? Number((data as any).payment_entry_value) : undefined,
          installments: (data as any).payment_installments ? Number((data as any).payment_installments) : undefined,
          dueDate: (data as any).payment_due_date ? new Date((data as any).payment_due_date + 'T00:00:00') : undefined,
        } : undefined,
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

  const updateSale = async (id: string, saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
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
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedSale: Sale = {
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
        saleDate: new Date(data.sale_date + 'T00:00:00'),
        isRental: data.is_rental || false,
        createdAt: new Date(data.created_at),
      };

      setSales((prev) =>
        prev.map((s) => (s.id === id ? updatedSale : s))
      );
      return updatedSale;
    } catch (error: any) {
      console.error('Error updating sale:', error);
      toast.error('Erro ao atualizar venda');
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

  const getMonthlyMetrics = useCallback((monthString?: string): DashboardMetrics => {
    const targetMonth = monthString || format(new Date(), 'yyyy-MM');
    const targetDate = parse(targetMonth, 'yyyy-MM', new Date());
    
    const targetMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const targetMonthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    const selectedMonthSales = sales.filter((s) => {
      const saleDate = new Date(s.saleDate);
      return saleDate >= targetMonthStart && saleDate <= targetMonthEnd;
    });

    const previousMonthDate = subMonths(targetDate, 1);
    const previousMonthStart = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1);
    const previousMonthEnd = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1, 0);
    
    const previousMonthSales = sales.filter((s) => {
      const saleDate = new Date(s.saleDate);
      return saleDate >= previousMonthStart && saleDate <= previousMonthEnd;
    });

    const monthlyRevenue = selectedMonthSales.reduce((sum, s) => sum + s.totalValue, 0);
    const lastMonthRevenue = previousMonthSales.reduce((sum, s) => sum + s.totalValue, 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const totalSquareMeters = selectedMonthSales.reduce((sum, s) => sum + (s.squareMeters || 0), 0);
    const lastMonthSquareMeters = previousMonthSales.reduce((sum, s) => sum + (s.squareMeters || 0), 0);
    const squareMetersGrowth = lastMonthSquareMeters > 0
      ? ((totalSquareMeters - lastMonthSquareMeters) / lastMonthSquareMeters) * 100
      : 0;

    const lonasSold = selectedMonthSales.filter((s) => s.category === 'lona').length;
    const tendasSold = selectedMonthSales.filter((s) => s.category === 'tenda').length;

    return {
      monthlyRevenue,
      revenueGrowth,
      totalSquareMeters,
      squareMetersGrowth,
      totalSales: selectedMonthSales.length,
      lonasSold,
      tendasSold,
    };
  }, [sales]);

  const getSalesByMonth = useCallback((monthString?: string) => {
    const targetMonth = monthString || format(new Date(), 'yyyy-MM');
    const targetDate = parse(targetMonth, 'yyyy-MM', new Date());
    
    const targetMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const targetMonthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    return sales.filter((s) => {
      const saleDate = new Date(s.saleDate);
      return saleDate >= targetMonthStart && saleDate <= targetMonthEnd;
    });
  }, [sales]);

  const getMonthName = useCallback((monthString: string) => {
    const targetDate = parse(monthString, 'yyyy-MM', new Date());
    return format(targetDate, "MMMM 'de' yyyy", { locale: ptBR });
  }, []);

  const getPreviousMonth = useCallback((monthString: string) => {
    const targetDate = parse(monthString, 'yyyy-MM', new Date());
    const previousMonth = subMonths(targetDate, 1);
    return format(previousMonth, 'yyyy-MM');
  }, []);

  const calculateGrowth = useCallback((current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Funções para vendas a prazo
  const getCreditSalesMetrics = useCallback(() => {
    const creditSales = sales.filter(s => s.paymentInfo?.method === 'fiado');
    
    // Total de vendas a prazo
    const totalCreditSales = creditSales.reduce((sum, s) => sum + s.totalValue, 0);
    
    // Vendas vencidas (data de vencimento anterior a hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueSales = creditSales.filter(s => {
      if (!s.paymentInfo?.dueDate) return false;
      const dueDate = new Date(s.paymentInfo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
    
    const totalOverdue = overdueSales.reduce((sum, s) => sum + s.totalValue, 0);
    
    // Vendas a vencer (próximos 7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const dueSoonSales = creditSales.filter(s => {
      if (!s.paymentInfo?.dueDate) return false;
      const dueDate = new Date(s.paymentInfo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= nextWeek;
    });
    
    const totalDueSoon = dueSoonSales.reduce((sum, s) => sum + s.totalValue, 0);
    
    return {
      totalCreditSales,
      totalOverdue,
      totalDueSoon,
      overdueCount: overdueSales.length,
      dueSoonCount: dueSoonSales.length,
      creditSalesCount: creditSales.length,
    };
  }, [sales]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    addSale,
    updateSale,
    deleteSale,
    getMonthlyMetrics,
    getSalesByMonth,
    getMonthName,
    getPreviousMonth,
    calculateGrowth,
    getCreditSalesMetrics,
    refetch: fetchSales,
  };
}
