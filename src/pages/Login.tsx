import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .max(100, 'Senha muito longa'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validação com zod
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    const loginResult = login(result.data.email, result.data.password);

    if (loginResult.success) {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } else {
      toast.error(loginResult.error || 'Erro ao fazer login');
      setErrors({ password: loginResult.error });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-64 h-32 flex items-center justify-center">
              <svg viewBox="0 0 1024 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Ondas coloridas */}
                <path d="M 50 100 Q 300 50 950 80" fill="none" stroke="#FFD700" strokeWidth="40" strokeLinecap="round"/>
                <path d="M 50 140 Q 300 90 950 120" fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round"/>
                <path d="M 50 170 Q 300 120 950 150" fill="none" stroke="#EF4444" strokeWidth="40" strokeLinecap="round"/>
                <path d="M 50 210 Q 300 160 950 190" fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round"/>
                <path d="M 50 240 Q 300 190 950 220" fill="none" stroke="#3B82F6" strokeWidth="40" strokeLinecap="round"/>
                <path d="M 50 280 Q 300 230 950 260" fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round"/>
                <path d="M 50 310 Q 300 260 950 290" fill="none" stroke="#4F46E5" strokeWidth="40" strokeLinecap="round"/>
                
                {/* Texto SHALON */}
                <text x="512" y="450" fontSize="140" fontWeight="bold" fill="#4F46E5" textAnchor="middle" fontFamily="Arial, sans-serif">
                  SHALON
                </text>
                
                {/* Texto Tendas&Coberturas */}
                <text x="512" y="550" fontSize="60" fill="#4F46E5" textAnchor="middle" fontFamily="Arial, sans-serif">
                  Tendas&amp;Coberturas
                </text>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Coberturas Shalon</h1>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>

        {/* Login Card */}
        <div className="metric-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#34414b] hover:bg-[#2c353b] text-white" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sistema de gestão - Coberturas Shalon
        </p>
      </div>
    </div>
  );
}
