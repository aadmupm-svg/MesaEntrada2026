export interface FechaAutoritativa {
  fecha: string;
  hora: string;
  anio: number;
}

const FUENTES = [
  "https://www.cloudflare.com",
  "https://api.github.com",
  "https://www.google.com",
];

const TTL_MS = 5 * 60 * 1000;
const MAX_DESFASE_MS = 5 * 60 * 1000;
const OFFSET_ART_MS = -3 * 60 * 60 * 1000;

interface CacheHora {
  deltaMs: number;
  expira: number;
}

let cache: CacheHora | null = null;

function desdeRelojLocal(): FechaAutoritativa {
  const ahora = new Date();
  return {
    fecha: `${String(ahora.getDate()).padStart(2, "0")}/${String(
      ahora.getMonth() + 1
    ).padStart(2, "0")}/${ahora.getFullYear()}`,
    hora: `${String(ahora.getHours()).padStart(2, "0")}:${String(
      ahora.getMinutes()
    ).padStart(2, "0")}`,
    anio: ahora.getFullYear(),
  };
}

async function obtenerDesfaseMs(): Promise<number | null> {
  for (const url of FUENTES) {
    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      const dateHeader = res.headers.get("date");
      if (!dateHeader) continue;

      const utcMs = Date.parse(dateHeader);
      if (Number.isNaN(utcMs)) continue;

      const desfase = utcMs - Date.now();
      if (Math.abs(desfase) > MAX_DESFASE_MS) continue;

      return desfase;
    } catch {
      // probar siguiente fuente
    }
  }
  return null;
}

function armar(desfaseMs: number): FechaAutoritativa {
  const dt = new Date(Date.now() + desfaseMs + OFFSET_ART_MS);
  return {
    fecha: `${String(dt.getUTCDate()).padStart(2, "0")}/${String(
      dt.getUTCMonth() + 1
    ).padStart(2, "0")}/${dt.getUTCFullYear()}`,
    hora: `${String(dt.getUTCHours()).padStart(2, "0")}:${String(
      dt.getUTCMinutes()
    ).padStart(2, "0")}`,
    anio: dt.getUTCFullYear(),
  };
}

export async function getFechaAutoritativa(): Promise<FechaAutoritativa> {
  if (cache && cache.expira > Date.now()) {
    return armar(cache.deltaMs);
  }

  const desfaseMs = await obtenerDesfaseMs();

  if (desfaseMs !== null) {
    cache = { deltaMs: desfaseMs, expira: Date.now() + TTL_MS };
    return armar(desfaseMs);
  }

  if (cache) {
    console.warn("API de hora no disponible, usando valor en cache");
    return armar(cache.deltaMs);
  }

  console.warn("API de hora no disponible, usando reloj local");
  return desdeRelojLocal();
}
