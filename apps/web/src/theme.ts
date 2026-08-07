import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    campo: string;
    titulo: string;
  }
  interface PaletteOptions {
    campo?: string;
    titulo?: string;
  }
}

export type Modo = "claro" | "oscuro";

export function getTheme(modo: Modo) {
  const oscuro = modo === "oscuro";

  return createTheme({
    palette: {
      mode: oscuro ? "dark" : "light",
      primary: { main: oscuro ? "#8db4e8" : "#0d3b66" },
      secondary: { main: oscuro ? "#7fbfb5" : "#377D71" },
      error: { main: oscuro ? "#ff8a80" : "#b23b3b" },
      background: {
        default: oscuro ? "#121212" : "#eae5ec",
        paper: oscuro ? "#1e1e1e" : "#ffffff",
      },
      campo: oscuro ? "#2a2a2a" : "#f7efed",
      titulo: oscuro ? "#37474f" : "#271d2e",
    },
    typography: {
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
      },
    },
  });
}
