import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employee: Employee;
  referenceMonth: string;
  referenceYear: number;
  advanceAmount: number;
  advancePercentage: number;
  grossSalary: number;
  paymentDate: string;
  employerName: string;
  employerDocument: string;
  employerAddress: string;
  usedInPayroll: boolean;
  payrollId: string | null;
  createdAt: string;
}

export function useSalaryAdvances() {
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salary_advances')
        .select(`
          *,
          employee:employees(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((advance: any) => ({
        id: advance.id,
        employeeId: advance.employee_id,
        employee: advance.employee,
        referenceMonth: advance.reference_month,
        referenceYear: advance.reference_year,
        advanceAmount: advance.advance_amount,
        advancePercentage: advance.advance_percentage,
        grossSalary: advance.gross_salary,
        paymentDate: advance.payment_date,
        employerName: advance.employer_name,
        employerDocument: advance.employer_document,
        employerAddress: advance.employer_address,
        usedInPayroll: advance.used_in_payroll,
        payrollId: advance.payroll_id,
        createdAt: advance.created_at,
      }));

      setAdvances(formattedData);
    } catch (error) {
      console.error('Error fetching salary advances:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAdvance = async (
    employee: Employee,
    customData: {
      month: string;
      year: number;
      advancePercentage?: number;
      employerData: {
        name: string;
        document: string;
        address: string;
      };
    }
  ) => {
    try {
      const percentage = customData.advancePercentage || 40;
      const advanceAmount = (employee.salary * percentage) / 100;

      const dbData = {
        employee_id: employee.id,
        reference_month: customData.month,
        reference_year: customData.year,
        advance_amount: parseFloat(advanceAmount.toFixed(2)),
        advance_percentage: parseFloat(percentage.toFixed(2)),
        gross_salary: parseFloat(employee.salary.toFixed(2)),
        payment_date: new Date().toISOString().split('T')[0],
        employer_name: customData.employerData.name.trim(),
        employer_document: customData.employerData.document.trim(),
        employer_address: customData.employerData.address.trim(),
        used_in_payroll: false,
        payroll_id: null,
      };

      const { data, error } = await supabase
        .from('salary_advances')
        .insert(dbData)
        .select(`
          *,
          employee:employees(*)
        `)
        .single();

      if (error) throw error;

      const frontendData: SalaryAdvance = {
        id: data.id,
        employeeId: data.employee_id,
        employee: data.employee,
        referenceMonth: data.reference_month,
        referenceYear: data.reference_year,
        advanceAmount: data.advance_amount,
        advancePercentage: data.advance_percentage,
        grossSalary: data.gross_salary,
        paymentDate: data.payment_date,
        employerName: data.employer_name,
        employerDocument: data.employer_document,
        employerAddress: data.employer_address,
        usedInPayroll: data.used_in_payroll,
        payrollId: data.payroll_id,
        createdAt: data.created_at,
      };

      setAdvances(prev => [frontendData, ...prev]);
      return frontendData;
    } catch (error) {
      console.error('Error generating salary advance:', error);
      throw error;
    }
  };

  const deleteAdvance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_advances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdvances(prev => prev.filter(advance => advance.id !== id));
    } catch (error) {
      console.error('Error deleting salary advance:', error);
      throw error;
    }
  };

  const getUnusedAdvance = async (employeeId: string, month: string, year: number) => {
    try {
      const { data, error } = await supabase
        .from('salary_advances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('reference_month', month)
        .eq('reference_year', year)
        .eq('used_in_payroll', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ? {
        id: data.id,
        advanceAmount: data.advance_amount,
        advancePercentage: data.advance_percentage,
      } : null;
    } catch (error) {
      console.error('Error getting unused advance:', error);
      return null;
    }
  };

  const markAdvanceAsUsed = async (advanceId: string, payrollId: string) => {
    try {
      const { error } = await supabase
        .from('salary_advances')
        .update({
          used_in_payroll: true,
          payroll_id: payrollId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', advanceId);

      if (error) throw error;

      setAdvances(prev => prev.map(adv => 
        adv.id === advanceId 
          ? { ...adv, usedInPayroll: true, payrollId } 
          : adv
      ));
    } catch (error) {
      console.error('Error marking advance as used:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  return {
    advances,
    loading,
    generateAdvance,
    deleteAdvance,
    getUnusedAdvance,
    markAdvanceAsUsed,
    refetch: fetchAdvances,
  };
}
