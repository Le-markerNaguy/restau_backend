"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDatabaseUrl = normalizeDatabaseUrl;
exports.ensureSslModeForSupabase = ensureSslModeForSupabase;
exports.getDatabaseUrlForRuntime = getDatabaseUrlForRuntime;
exports.extractPostgresHostPort = extractPostgresHostPort;
exports.databaseUrlDiagnostics = databaseUrlDiagnostics;
/**
 * Nettoie DATABASE_URL (guillemets copiés depuis Render, retours ligne, espaces).
 * Un mot de passe avec @ non encodé casse aussi l’URL : il doit être encodé (ex. %40).
 */
function normalizeDatabaseUrl(raw) {
    if (raw == null)
        return "";
    let s = String(raw).trim();
    // BOM UTF-8
    if (s.charCodeAt(0) === 0xfeff)
        s = s.slice(1).trim();
    if ((s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1).trim();
    }
    s = s.replace(/\r?\n/g, "").trim();
    // Erreur fréquente sur Render : coller la ligne entière du .env ("DATABASE_URL=postgresql://...")
    // au lieu de la seule valeur après le "=".
    let prev = "";
    while (prev !== s) {
        prev = s;
        s = s.replace(/^\s*export\s+DATABASE_URL\s*=\s*/i, "").trim();
        s = s.replace(/^\s*DATABASE_URL\s*=\s*/i, "").trim();
    }
    return s;
}
/**
 * Depuis Render (ou autre cloud), Supabase exige souvent SSL sur le pooler / direct.
 */
function ensureSslModeForSupabase(url) {
    const s = normalizeDatabaseUrl(url);
    if (!s)
        return s;
    if (/sslmode=/i.test(s))
        return s;
    if (!/supabase\.co|pooler\.supabase\.com/i.test(s))
        return s;
    const sep = s.includes("?") ? "&" : "?";
    return `${s}${sep}sslmode=verify-full`;
}
/**
 * Chaîne finale pour le driver `pg` / Prisma adapter (normalisation + SSL Supabase).
 */
function getDatabaseUrlForRuntime(raw) {
    return ensureSslModeForSupabase(normalizeDatabaseUrl(raw));
}
/**
 * Extrait hôte et port pour les logs, sans utiliser `new URL()`.
 * Accepte une URI avec ou sans préfixe `postgresql://` (certaines configs Render).
 */
function extractPostgresHostPort(connectionString) {
    const s = normalizeDatabaseUrl(connectionString);
    if (!s)
        return null;
    let rest = s;
    const protoMatch = /^postgres(?:ql)?:\/\//i.exec(s);
    if (protoMatch) {
        rest = s.slice(protoMatch[0].length);
    }
    const slashIdx = rest.indexOf("/");
    const qIdx = rest.indexOf("?");
    let end = rest.length;
    if (slashIdx !== -1)
        end = Math.min(end, slashIdx);
    if (qIdx !== -1)
        end = Math.min(end, qIdx);
    const authority = rest.slice(0, end);
    if (!authority)
        return null;
    const atIdx = authority.lastIndexOf("@");
    const hostPort = atIdx === -1 ? authority : authority.slice(atIdx + 1);
    if (!hostPort)
        return null;
    const colonIdx = hostPort.indexOf(":");
    if (colonIdx === -1) {
        return { host: hostPort, port: "" };
    }
    return {
        host: hostPort.slice(0, colonIdx),
        port: hostPort.slice(colonIdx + 1),
    };
}
/** Infos sûres pour le debug Render (aucun secret). */
function databaseUrlDiagnostics(raw) {
    const s = normalizeDatabaseUrl(raw);
    if (!s)
        return "vide";
    const at = (s.match(/@/g) || []).length;
    const hasProto = /^postgres(?:ql)?:\/\//i.test(s);
    return `longueur=${s.length}, préfixe postgres://=${hasProto}, nb_@=${at}`;
}
