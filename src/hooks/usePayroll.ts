import { useState, useEffect } from 'react';
import { Payroll, Employee } from '@/types';
import { supabase } from '@/lib/supabase';
import { calculatePayroll, getCurrentReferenceDate, formatCurrency } from '@/utils/payrollCalculations';

export function usePayroll() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayrolls = async () => {
    try {
      console.log('Fetching payrolls...');
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          *,
          employee:employees(*)
        `)
        .order('reference_year', { ascending: false })
        .order('reference_month', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        
        // Se o erro for de tabela não existente, não lançar erro
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Payrolls table does not exist yet');
          setPayrolls([]);
          return;
        }
        
        throw error;
      }
      
      console.log('Raw payrolls from DB:', data);
      
      // Transformar os dados do banco para o formato do frontend
      const transformedData = (data || []).map(payroll => ({
        ...payroll,
        employee: payroll.employee,
        grossSalary: payroll.gross_salary,
        deductions: {
          inss: payroll.deductions?.inss || 0,
          fgts: payroll.deductions?.fgts || 0,
          irrf: payroll.deductions?.irrf || 0,
          other: payroll.deductions?.other || 0,
          total: payroll.deductions?.total || 0,
        },
        additions: {
          overtime: payroll.additions?.overtime || 0,
          bonuses: payroll.additions?.bonuses || 0,
          vacation: payroll.additions?.vacation || 0,
          thirteenth: payroll.additions?.thirteenth || 0,
          other: payroll.additions?.other || 0,
          total: payroll.additions?.total || 0,
        },
        netSalary: payroll.net_salary,
        paymentDate: payroll.payment_date,
        employerName: payroll.employer_name,
        employerDocument: payroll.employer_document,
        employerAddress: payroll.employer_address,
        createdAt: payroll.created_at,
      }));
      
      console.log('Transformed payrolls:', transformedData);
      setPayrolls(transformedData);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      // Não lançar erro para não quebrar a aplicação
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async (employee: Employee, customData?: {
    month?: string;
    year?: number;
    additions?: {
      overtime?: number;
      bonuses?: number;
      vacation?: number;
      thirteenth?: number;
      other?: number;
    };
    deductions?: {
      inss?: number;
      fgts?: number;
      irrf?: number;
      other?: number;
    };
    employerData?: {
      name: string;
      document: string;
      address: string;
    };
  }) => {
    try {
      const { month, year } = getCurrentReferenceDate();
      const referenceMonth = customData?.month || month;
      const referenceYear = customData?.year || year;
      
      // Verificar se já existe holerite para este mês/ano
      const existingPayroll = payrolls.find(
        p => p.employeeId === employee.id && 
        p.referenceMonth === referenceMonth && 
        p.referenceYear === referenceYear
      );
      
      if (existingPayroll) {
        throw new Error('Já existe um holerite para este mês/ano');
      }
      
      // Calcular folha de pagamento com valores manuais
      const calculation = calculatePayroll(
        employee.salary,
        customData?.additions || {},
        customData?.deductions || {}
      );
      
      const employerData = customData?.employerData || {
        name: 'Empresa padrão',
        document: '00.000.000/0001-00',
        address: 'Endereço padrão',
      };
      
      // Validar dados antes de enviar
      if (!employee.id) {
        throw new Error('Funcionário sem ID válido');
      }

      if (!employerData.name || !employerData.document || !employerData.address) {
        throw new Error('Dados do empregador incompletos');
      }

      // Transformar para formato do banco (exatamente como na inserção manual que funcionou)
      const dbData = {
        employee_id: employee.id,
        reference_month: String(referenceMonth).padStart(2, '0'),
        reference_year: Number(referenceYear),
        gross_salary: parseFloat(calculation.grossSalary.toFixed(2)),
        deductions: {
          inss: parseFloat(calculation.deductions.inss.toFixed(2)),
          fgts: parseFloat(calculation.deductions.fgts.toFixed(2)),
          irrf: parseFloat(calculation.deductions.irrf.toFixed(2)),
          other: parseFloat(calculation.deductions.other.toFixed(2)),
          total: parseFloat(calculation.deductions.total.toFixed(2)),
        },
        additions: {
          overtime: parseFloat(calculation.additions.overtime.toFixed(2)),
          bonuses: parseFloat(calculation.additions.bonuses.toFixed(2)),
          vacation: parseFloat(calculation.additions.vacation.toFixed(2)),
          thirteenth: parseFloat(calculation.additions.thirteenth.toFixed(2)),
          other: parseFloat(calculation.additions.other.toFixed(2)),
          total: parseFloat(calculation.additions.total.toFixed(2)),
        },
        net_salary: parseFloat(calculation.netSalary.toFixed(2)),
        payment_date: new Date().toISOString().split('T')[0],
        employer_name: employerData.name.trim(),
        employer_document: employerData.document.trim(),
        employer_address: employerData.address.trim(),
      };
      
      console.log('Creating payroll with data:', dbData);
      console.log('Employee ID:', employee.id);
      console.log('Reference:', referenceMonth, '/', referenceYear);
      
      const { data, error } = await supabase
        .from('payrolls')
        .insert([dbData])
        .select(`
          *,
          employee:employees(*)
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Se o erro for de tabela não existente
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          throw new Error('A tabela de holerites não foi criada ainda. Execute o SQL manualmente no painel Supabase.');
        }
        
        // Erro mais descritivo
        const errorMessage = error.message || error.details || 'Erro desconhecido ao criar holerite';
        throw new Error(`Erro do Supabase: ${errorMessage}`);
      }
      
      console.log('Payroll created successfully:', data);
      
      // Transformar para formato do frontend e adicionar à lista
      const frontendData = {
        ...data,
        employee: data.employee,
        grossSalary: data.gross_salary,
        deductions: data.deductions,
        additions: data.additions,
        netSalary: data.net_salary,
        paymentDate: data.payment_date,
        employerName: data.employer_name,
        employerDocument: data.employer_document,
        employerAddress: data.employer_address,
        createdAt: data.created_at,
      };
      
      setPayrolls(prev => [frontendData, ...prev]);
      return frontendData;
    } catch (error) {
      console.error('Error generating payroll:', error);
      throw error;
    }
  };

  const deletePayroll = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payrolls')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPayrolls(prev => prev.filter(payroll => payroll.id !== id));
    } catch (error) {
      console.error('Error deleting payroll:', error);
      throw error;
    }
  };

  const updatePayroll = async (id: string, employee: Employee, customData: any) => {
    try {
      const calculation = calculatePayroll(
        employee.salary,
        customData?.additions || {},
        customData?.deductions || {}
      );
      
      const employerData = customData?.employerData || {
        name: 'Empresa padrão',
        document: '00.000.000/0001-00',
        address: 'Endereço padrão',
      };

      const dbData = {
        reference_month: customData?.month,
        reference_year: customData?.year,
        gross_salary: parseFloat(calculation.grossSalary.toFixed(2)),
        deductions: {
          inss: parseFloat(calculation.deductions.inss.toFixed(2)),
          fgts: parseFloat(calculation.deductions.fgts.toFixed(2)),
          irrf: parseFloat(calculation.deductions.irrf.toFixed(2)),
          other: parseFloat(calculation.deductions.other.toFixed(2)),
          total: parseFloat(calculation.deductions.total.toFixed(2)),
        },
        additions: {
          overtime: parseFloat(calculation.additions.overtime.toFixed(2)),
          bonuses: parseFloat(calculation.additions.bonuses.toFixed(2)),
          vacation: parseFloat(calculation.additions.vacation.toFixed(2)),
          thirteenth: parseFloat(calculation.additions.thirteenth.toFixed(2)),
          other: parseFloat(calculation.additions.other.toFixed(2)),
          total: parseFloat(calculation.additions.total.toFixed(2)),
        },
        net_salary: parseFloat(calculation.netSalary.toFixed(2)),
        employer_name: employerData.name.trim(),
        employer_document: employerData.document.trim(),
        employer_address: employerData.address.trim(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('payrolls')
        .update(dbData)
        .eq('id', id)
        .select(`
          *,
          employee:employees(*)
        `)
        .single();

      if (error) throw error;

      const frontendData = {
        id: data.id,
        employeeId: data.employee_id,
        employee: data.employee,
        referenceMonth: data.reference_month,
        referenceYear: data.reference_year,
        grossSalary: data.gross_salary,
        deductions: data.deductions,
        additions: data.additions,
        netSalary: data.net_salary,
        paymentDate: data.payment_date,
        employerName: data.employer_name,
        employerDocument: data.employer_document,
        employerAddress: data.employer_address,
        createdAt: data.created_at,
      };
      
      setPayrolls(prev => prev.map(p => p.id === id ? frontendData : p));
      return frontendData;
    } catch (error) {
      console.error('Error updating payroll:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  return {
    payrolls,
    loading,
    generatePayroll,
    deletePayroll,
    updatePayroll,
    refetch: fetchPayrolls,
  };
}
