/**
 * Nettoie DATABASE_URL (guillemets copiés depuis Render, retours ligne, espaces).
 * Un mot de passe avec @ non encodé casse aussi l’URL : il doit être encodé (ex. %40).
 */
export function normalizeDatabaseUrl(raw: string | undefined): string {
  if (raw == null) return "";
  let s = String(raw).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.replace(/\r?\n/g, "").trim();
}

/**
 * Extrait hôte et port pour les logs, sans utiliser `new URL()` (souvent incompatible avec postgresql://).
 */
export function extractPostgresHostPort(connectionString: string): {
  host: string;
  port: string;
} | null {
  const s = normalizeDatabaseUrl(connectionString);
  if (!s) return null;
  const m = /^postgres(?:ql)?:\/\//i.exec(s);
  if (!m) return null;
  const rest = s.slice(m[0].length);
  const slashIdx = rest.indexOf("/");
  const qIdx = rest.indexOf("?");
  let end = rest.length;
  if (slashIdx !== -1) end = Math.min(end, slashIdx);
  if (qIdx !== -1) end = Math.min(end, qIdx);
  const authority = rest.slice(0, end);
  const atIdx = authority.lastIndexOf("@");
  const hostPort = atIdx === -1 ? authority : authority.slice(atIdx + 1);
  const colonIdx = hostPort.indexOf(":");
  if (colonIdx === -1) {
    return { host: hostPort, port: "" };
  }
  return {
    host: hostPort.slice(0, colonIdx),
    port: hostPort.slice(colonIdx + 1),
  };
}
