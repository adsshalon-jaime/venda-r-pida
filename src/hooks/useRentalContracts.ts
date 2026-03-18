import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RentalContract } from '@/types';
import { toast } from 'sonner';

export function useRentalContracts() {
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('rental_contracts')
        .select('*')
        .order('contract_date', { ascending: false });

      if (error) throw error;

      const formattedContracts: RentalContract[] = (data || []).map((contract: any) => ({
        id: contract.id,
        contractNumber: contract.contract_number,
        contractDate: new Date(contract.contract_date),
        customerId: contract.customer_id,
        customerName: contract.customer_name,
        customerDocument: contract.customer_document,
        customerAddress: contract.customer_address,
        customerCity: contract.customer_city,
        customerState: contract.customer_state,
        customerPhone: contract.customer_phone,
        customerReference: contract.customer_reference,
        items: contract.items || [],
        rentalPeriod: contract.rental_period,
        rentalDuration: contract.rental_duration,
        startDate: new Date(contract.start_date),
        endDate: new Date(contract.end_date),
        subtotal: parseFloat(contract.subtotal),
        shippingFee: parseFloat(contract.shipping_fee),
        assemblyFee: parseFloat(contract.assembly_fee),
        totalValue: parseFloat(contract.total_value),
        paymentMethod: contract.payment_method,
        pixKey: contract.pix_key,
        createdAt: new Date(contract.created_at),
        updatedAt: new Date(contract.updated_at),
      }));

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const addContract = async (contractData: Omit<RentalContract, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('rental_contracts')
        .insert({
          contract_number: contractData.contractNumber,
          contract_date: contractData.contractDate.toISOString(),
          customer_id: contractData.customerId,
          customer_name: contractData.customerName,
          customer_document: contractData.customerDocument,
          customer_address: contractData.customerAddress,
          customer_city: contractData.customerCity,
          customer_state: contractData.customerState,
          customer_phone: contractData.customerPhone,
          customer_reference: contractData.customerReference,
          items: contractData.items,
          rental_period: contractData.rentalPeriod,
          rental_duration: contractData.rentalDuration,
          start_date: contractData.startDate.toISOString().split('T')[0],
          end_date: contractData.endDate.toISOString().split('T')[0],
          subtotal: contractData.subtotal,
          shipping_fee: contractData.shippingFee,
          assembly_fee: contractData.assemblyFee,
          total_value: contractData.totalValue,
          payment_method: contractData.paymentMethod,
          pix_key: contractData.pixKey,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Contrato criado com sucesso!');
      await loadContracts();
      return data;
    } catch (error) {
      console.error('Error adding contract:', error);
      toast.error('Erro ao criar contrato');
      throw error;
    }
  };

  const updateContract = async (id: string, contractData: Partial<RentalContract>) => {
    try {
      const updateData: any = {};

      if (contractData.contractNumber) updateData.contract_number = contractData.contractNumber;
      if (contractData.contractDate) updateData.contract_date = contractData.contractDate.toISOString();
      if (contractData.customerId !== undefined) updateData.customer_id = contractData.customerId;
      if (contractData.customerName) updateData.customer_name = contractData.customerName;
      if (contractData.customerDocument !== undefined) updateData.customer_document = contractData.customerDocument;
      if (contractData.customerAddress !== undefined) updateData.customer_address = contractData.customerAddress;
      if (contractData.customerCity !== undefined) updateData.customer_city = contractData.customerCity;
      if (contractData.customerState !== undefined) updateData.customer_state = contractData.customerState;
      if (contractData.customerPhone !== undefined) updateData.customer_phone = contractData.customerPhone;
      if (contractData.customerReference !== undefined) updateData.customer_reference = contractData.customerReference;
      if (contractData.items) updateData.items = contractData.items;
      if (contractData.rentalPeriod) updateData.rental_period = contractData.rentalPeriod;
      if (contractData.rentalDuration) updateData.rental_duration = contractData.rentalDuration;
      if (contractData.startDate) updateData.start_date = contractData.startDate.toISOString().split('T')[0];
      if (contractData.endDate) updateData.end_date = contractData.endDate.toISOString().split('T')[0];
      if (contractData.subtotal !== undefined) updateData.subtotal = contractData.subtotal;
      if (contractData.shippingFee !== undefined) updateData.shipping_fee = contractData.shippingFee;
      if (contractData.assemblyFee !== undefined) updateData.assembly_fee = contractData.assemblyFee;
      if (contractData.totalValue !== undefined) updateData.total_value = contractData.totalValue;
      if (contractData.paymentMethod) updateData.payment_method = contractData.paymentMethod;
      if (contractData.pixKey !== undefined) updateData.pix_key = contractData.pixKey;

      const { error } = await (supabase as any)
        .from('rental_contracts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Contrato atualizado com sucesso!');
      await loadContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('Erro ao atualizar contrato');
      throw error;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('rental_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Contrato excluído com sucesso!');
      await loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Erro ao excluir contrato');
      throw error;
    }
  };

  return {
    contracts,
    loading,
    addContract,
    updateContract,
    deleteContract,
    loadContracts,
  };
}
