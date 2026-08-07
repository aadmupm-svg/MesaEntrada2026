import { createContext, useState, type ReactNode } from "react";

interface AuthContextType {
  auth: boolean;
  user: string | null;
  login: (token: string, usuario: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<boolean>(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState<string | null>(() => localStorage.getItem("user"));

  const login = (token: string, usuario: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", usuario);
    setAuth(true);
    setUser(usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ auth, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
