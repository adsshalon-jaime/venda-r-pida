import { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { supabase } from '@/lib/supabase';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }
      
      console.log('Raw data from DB:', data);
      
      // Transformar os dados do banco para o formato do frontend
      const transformedData = (data || []).map(emp => ({
        ...emp,
        backupPhone: emp.backup_phone,
        entryDate: emp.entry_date,
        exitDate: emp.exit_date,
        workHours: emp.work_hours,
        lunchBreak: emp.lunch_break,
        workSchedule: emp.work_schedule,
      }));
      
      console.log('Transformed employees:', transformedData);
      setEmployees(transformedData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      console.log('Adding employee:', employeeData);
      
      // Transformar os dados para o formato do banco
      const dbData = {
        name: employeeData.name,
        cpf: employeeData.cpf,
        address: employeeData.address,
        phone: employeeData.phone,
        backup_phone: employeeData.backupPhone,
        entry_date: employeeData.entryDate,
        exit_date: employeeData.exitDate,
        work_hours: employeeData.workHours,
        lunch_break: employeeData.lunchBreak,
        salary: employeeData.salary,
        work_schedule: employeeData.workSchedule,
      };
      
      console.log('Transformed data for DB:', dbData);
      
      const { data, error } = await supabase
        .from('employees')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Employee added successfully:', data);
      
      if (data) {
        // Transformar os dados de volta para o formato do frontend
        const frontendData = {
          ...data,
          backupPhone: data.backup_phone,
          entryDate: data.entry_date,
          exitDate: data.exit_date,
          workHours: data.work_hours,
          lunchBreak: data.lunch_break,
          workSchedule: data.work_schedule,
        };
        setEmployees(prev => [...prev, frontendData]);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setEmployees(prev => prev.map(emp => emp.id === id ? data : emp));
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees
  };
}
