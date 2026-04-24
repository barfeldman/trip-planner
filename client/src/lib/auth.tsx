import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const USERS: Record<string, string> = {
  Bar: '123456',
  Nofar: 'Nofar123',
};

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
  );

  const login = useCallback((username: string, password: string): boolean => {
    if (USERS[username] === password) {
      setUser(username);
      localStorage.setItem('auth_user', username);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
