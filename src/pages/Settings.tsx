import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building2, Palette, Bell } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, loading, saving, saveSettings } = useSettings();
  const [formData, setFormData] = useState({
    company_name: '',
    cnpj: '',
    phone: '',
    theme: 'light' as 'light' | 'dark',
    notifications_enabled: true
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name,
        cnpj: settings.cnpj || '',
        phone: settings.phone || '',
        theme: settings.theme,
        notifications_enabled: settings.notifications_enabled
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const result = await saveSettings(formData);
    if (result.success) {
      toast.success('Configurações salvas com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao salvar configurações');
    }
  };
  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Personalize seu painel administrativo
          </p>
        </div>

        <div className="space-y-8">
          {/* Company Info */}
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Dados da Empresa</h2>
                <p className="text-sm text-muted-foreground">
                  Informações que aparecem nos relatórios
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input 
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Nome da empresa"
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input 
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  disabled={loading || saving}
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-2">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Aparência</h2>
                <p className="text-sm text-muted-foreground">
                  Personalize a interface do sistema
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant={formData.theme === 'light' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => handleInputChange('theme', 'light')}
                disabled={loading || saving}
              >
                Modo Claro
              </Button>
              <Button 
                variant={formData.theme === 'dark' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={() => handleInputChange('theme', 'dark')}
                disabled={loading || saving}
              >
                Modo Escuro
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Notificações</h2>
                <p className="text-sm text-muted-foreground">
                  Configure os alertas do sistema
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações por Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas sobre vendas e atividades
                  </p>
                </div>
                <Button
                  variant={formData.notifications_enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('notifications_enabled', !formData.notifications_enabled)}
                  disabled={loading || saving}
                >
                  {formData.notifications_enabled ? 'Ativado' : 'Desativado'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={loading || saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
