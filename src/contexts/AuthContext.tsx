import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciais válidas (em produção, isso seria validado no backend)
const VALID_CREDENTIALS = {
  email: 'contato@sistema.com',
  password: 'Jaime101020@',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('userEmail');
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [isAuthenticated, userEmail]);

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedValidEmail = VALID_CREDENTIALS.email.toLowerCase();

    if (normalizedEmail === normalizedValidEmail && password === VALID_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setUserEmail(email.trim());
      return { success: true };
    }

    return { success: false, error: 'Email ou senha incorretos' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
