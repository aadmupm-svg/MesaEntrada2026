import "dotenv/config";

export function parseConnectionUrl(url: string | undefined) {
  const fallback: Record<string, string | undefined> = {};
  const value = url ?? "";

  try {
    const parsed = new URL(value);
    fallback.host = parsed.hostname || "localhost";
    fallback.user = decodeURIComponent(parsed.username || "");
    fallback.password = decodeURIComponent(parsed.password || "");
    fallback.database = parsed.pathname.replace(/^\//, "") || "";
  } catch {
    fallback.host = "localhost";
  }

  return fallback;
}
