import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type CompanySettings = Database['public']['Tables']['company_settings']['Row'];
type CompanySettingsInsert = Database['public']['Tables']['company_settings']['Insert'];

export function useSettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading settings:', error);
      }

      if (data) {
        setSettings(data);
      } else {
        // Set default values if no settings exist
        setSettings({
          id: '',
          company_name: 'Tendas & Lonas',
          cnpj: '',
          phone: '',
          theme: 'light',
          notifications_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      setSaving(true);

      const settingsToSave: CompanySettingsInsert = {
        ...settings,
        ...newSettings,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (settings?.id) {
        // Update existing settings
        result = await supabase
          .from('company_settings')
          .update(settingsToSave)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await supabase
          .from('company_settings')
          .insert(settingsToSave)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setSettings(result.data);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao salvar configurações' };
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    saveSettings,
    loadSettings
  };
}
