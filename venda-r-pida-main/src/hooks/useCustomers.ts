import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { toast } from 'sonner';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedCustomers: Customer[] = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || undefined,
        email: c.email || undefined,
      }));

      setCustomers(mappedCustomers);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          phone: customerData.phone || null,
          email: customerData.email || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
      };

      setCustomers((prev) => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error('Erro ao adicionar cliente');
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone || null,
          email: customerData.email || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCustomer: Customer = {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
      };

      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? updatedCustomer : c))
      );
      return updatedCustomer;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);

      if (error) throw error;

      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}
