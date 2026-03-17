import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building2, Palette, Bell } from 'lucide-react';

export default function Settings() {
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
                <Input defaultValue="Tendas & Lonas" />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(00) 00000-0000" />
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
              <Button variant="outline" className="flex-1">
                Modo Claro
              </Button>
              <Button variant="secondary" className="flex-1">
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

            <p className="text-sm text-muted-foreground">
              Configurações de notificação disponíveis em breve.
            </p>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
