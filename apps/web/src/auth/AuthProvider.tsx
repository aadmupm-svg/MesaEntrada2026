import { createContext, useState, type ReactNode } from "react";

interface AuthContextType {
  auth: boolean;
  user: string | null;
  isAdmin: boolean;
  login: (token: string, usuario: string, admin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<boolean>(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState<string | null>(() => localStorage.getItem("user"));
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => localStorage.getItem("admin") === "true"
  );

  const login = (token: string, usuario: string, admin: boolean) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", usuario);
    localStorage.setItem("admin", String(admin));
    setAuth(true);
    setUser(usuario);
    setIsAdmin(admin);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    setAuth(false);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ auth, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
