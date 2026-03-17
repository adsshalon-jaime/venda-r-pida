import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Quote, QuoteItem, QuoteStatus } from '@/types';
import { toast } from 'sonner';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedQuotes: Quote[] = (data || []).map((q: any) => ({
        id: q.id,
        quoteNumber: q.quote_number,
        customerId: q.customer_id || undefined,
        customerName: q.customer_name,
        customerEmail: q.customer_email || undefined,
        customerPhone: q.customer_phone || undefined,
        items: q.items || [],
        subtotal: Number(q.subtotal),
        shippingCost: Number(q.shipping_cost),
        total: Number(q.total),
        deliveryAddress: q.delivery_address,
        deliveryDeadline: q.delivery_deadline,
        validUntil: new Date(q.valid_until + 'T00:00:00'),
        paymentInfo: {
          method: q.payment_method,
          installments: q.payment_installments > 1 ? q.payment_installments : undefined,
        },
        notes: q.notes || undefined,
        status: q.status as QuoteStatus,
        createdAt: new Date(q.created_at),
        updatedAt: new Date(q.updated_at),
        convertedToSaleId: q.converted_to_sale_id || undefined,
      }));

      setQuotes(mappedQuotes);
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORC-${year}${month}${day}-${random}`;
  };

  const addQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber'>) => {
    try {
      const quoteNumber = generateQuoteNumber();

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          quote_number: quoteNumber,
          customer_id: quoteData.customerId || null,
          customer_name: quoteData.customerName,
          customer_email: quoteData.customerEmail || null,
          customer_phone: quoteData.customerPhone || null,
          items: quoteData.items,
          subtotal: quoteData.subtotal,
          shipping_cost: quoteData.shippingCost,
          total: quoteData.total,
          delivery_address: quoteData.deliveryAddress,
          delivery_deadline: quoteData.deliveryDeadline,
          valid_until: quoteData.validUntil.toISOString().split('T')[0],
          payment_method: quoteData.paymentInfo.method,
          payment_installments: quoteData.paymentInfo.installments || 1,
          notes: quoteData.notes || null,
          status: quoteData.status,
          converted_to_sale_id: quoteData.convertedToSaleId || null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const newQuote: Quote = {
        id: data.id,
        quoteNumber: data.quote_number,
        customerId: data.customer_id || undefined,
        customerName: data.customer_name,
        customerEmail: data.customer_email || undefined,
        customerPhone: data.customer_phone || undefined,
        items: data.items || [],
        subtotal: Number(data.subtotal),
        shippingCost: Number(data.shipping_cost),
        total: Number(data.total),
        deliveryAddress: data.delivery_address,
        deliveryDeadline: data.delivery_deadline,
        paymentInfo: {
          method: data.payment_method,
          installments: data.payment_installments > 1 ? data.payment_installments : undefined,
        },
        validUntil: new Date(data.valid_until + 'T00:00:00'),
        notes: data.notes || undefined,
        status: data.status as QuoteStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        convertedToSaleId: data.converted_to_sale_id || undefined,
      };

      setQuotes((prev) => [newQuote, ...prev]);
      toast.success('Orçamento criado com sucesso!');
      return newQuote;
    } catch (error: any) {
      console.error('Error adding quote:', error);
      toast.error('Erro ao criar orçamento');
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      const updateData: any = {};
      
      if (updates.customerId !== undefined) updateData.customer_id = updates.customerId || null;
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
      if (updates.customerEmail !== undefined) updateData.customer_email = updates.customerEmail || null;
      if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone || null;
      if (updates.items !== undefined) updateData.items = updates.items;
      if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
      if (updates.shippingCost !== undefined) updateData.shipping_cost = updates.shippingCost;
      if (updates.total !== undefined) updateData.total = updates.total;
      if (updates.deliveryAddress !== undefined) updateData.delivery_address = updates.deliveryAddress;
      if (updates.deliveryDeadline !== undefined) updateData.delivery_deadline = updates.deliveryDeadline;
      if (updates.validUntil !== undefined) updateData.valid_until = updates.validUntil.toISOString().split('T')[0];
      if (updates.paymentInfo !== undefined) {
        updateData.payment_method = updates.paymentInfo.method;
        updateData.payment_installments = updates.paymentInfo.installments || 1;
      }
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.convertedToSaleId !== undefined) updateData.converted_to_sale_id = updates.convertedToSaleId || null;

      const { data, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setQuotes((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                ...updates,
                updatedAt: new Date(),
              }
            : q
        )
      );

      toast.success('Orçamento atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating quote:', error);
      toast.error('Erro ao atualizar orçamento');
      throw error;
    }
  };

  const updateQuoteStatus = async (id: string, status: QuoteStatus, convertedToSaleId?: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          status,
          converted_to_sale_id: convertedToSaleId || null,
        } as any)
        .eq('id', id);

      if (error) throw error;

      setQuotes((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                status,
                convertedToSaleId,
                updatedAt: new Date(),
              }
            : q
        )
      );

      const statusMessages = {
        pending: 'Orçamento marcado como pendente',
        approved: 'Orçamento aprovado!',
        rejected: 'Orçamento rejeitado',
        converted: 'Orçamento convertido em venda!',
      };

      toast.success(statusMessages[status]);
    } catch (error: any) {
      console.error('Error updating quote status:', error);
      toast.error('Erro ao atualizar status do orçamento');
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);

      if (error) throw error;

      setQuotes((prev) => prev.filter((q) => q.id !== id));
      toast.success('Orçamento excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      toast.error('Erro ao excluir orçamento');
      throw error;
    }
  };

  const getQuotesByStatus = useCallback(
    (status: QuoteStatus) => {
      return quotes.filter((q) => q.status === status);
    },
    [quotes]
  );

  const getQuotesMetrics = useCallback(() => {
    const pending = quotes.filter((q) => q.status === 'pending');
    const approved = quotes.filter((q) => q.status === 'approved');
    const converted = quotes.filter((q) => q.status === 'converted');

    return {
      totalQuotes: quotes.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      convertedCount: converted.length,
      totalPendingValue: pending.reduce((sum, q) => sum + q.total, 0),
      totalApprovedValue: approved.reduce((sum, q) => sum + q.total, 0),
      totalConvertedValue: converted.reduce((sum, q) => sum + q.total, 0),
    };
  }, [quotes]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return {
    quotes,
    loading,
    addQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
    getQuotesByStatus,
    getQuotesMetrics,
    refetch: fetchQuotes,
  };
}
