import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./theme";
import type { Modo } from "./theme";

interface ThemeModeContextValue {
  modo: Modo;
  alternarModo: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  modo: "claro",
  alternarModo: () => {},
});

const KEY = "mesa-entrada-modo";

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo>(() => {
    const guardado = localStorage.getItem(KEY);
    return guardado === "oscuro" ? "oscuro" : "claro";
  });

  useEffect(() => {
    localStorage.setItem(KEY, modo);
  }, [modo]);

  const alternarModo = useCallback(() => {
    setModo((m) => (m === "claro" ? "oscuro" : "claro"));
  }, []);

  const theme = useMemo(() => getTheme(modo), [modo]);

  const value = useMemo(() => ({ modo, alternarModo }), [modo, alternarModo]);

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
