import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SavedReport } from '@/types/reports';
import { toast } from 'sonner';

export function useReports() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReports: SavedReport[] = (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        data: r.data,
        createdAt: new Date(r.created_at),
      }));

      setReports(mappedReports);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Erro ao carregar relatórios salvos');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReport = async (reportData: Omit<SavedReport, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .insert({
          title: reportData.title,
          type: reportData.type,
          start_date: reportData.startDate.toISOString(),
          end_date: reportData.endDate.toISOString(),
          data: reportData.data,
        })
        .select()
        .single();

      if (error) throw error;

      const newReport: SavedReport = {
        id: data.id,
        title: data.title,
        type: data.type,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        data: data.data,
        createdAt: new Date(data.created_at),
      };

      setReports((prev) => [newReport, ...prev]);
      return newReport;
    } catch (error: any) {
      console.error('Error saving report:', error);
      toast.error('Erro ao salvar relatório');
      throw error;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase.from('saved_reports').delete().eq('id', id);

      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success('Relatório excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error('Erro ao excluir relatório');
      throw error;
    }
  };

  return {
    reports,
    loading,
    fetchReports,
    saveReport,
    deleteReport,
  };
}
