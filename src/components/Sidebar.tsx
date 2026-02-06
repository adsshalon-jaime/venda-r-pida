import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, FileText, DollarSign } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileSignature } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Produtos', url: '/produtos', icon: Package },
  { title: 'Vendas', url: '/vendas', icon: ShoppingCart },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Relatórios', url: '/relatorios', icon: FileText },
  { title: 'Recibos', url: '/recibos', icon: DollarSign },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return (
    <aside className={`w-64 h-screen bg-card border-r border-border flex flex-col ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Sistema de Vendas</h1>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === '/'}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-[#34414b] hover:text-white transition-colors"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-border space-y-3">
        {userEmail && (
          <div className="px-4 py-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Logado como</p>
            <p className="text-sm font-medium truncate">{userEmail}</p>
          </div>
        )}
        <NavLink
          to="/configuracoes"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-[#34414b] hover:text-white transition-colors"
          activeClassName="bg-primary/10 text-primary font-medium"
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </NavLink>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-white hover:bg-[#34414b]"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
