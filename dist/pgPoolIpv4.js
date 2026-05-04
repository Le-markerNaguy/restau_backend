"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolConfigPreferIpv4 = poolConfigPreferIpv4;
exports.prismaPgPoolFromDatabaseUrl = prismaPgPoolFromDatabaseUrl;
const node_dns_1 = __importDefault(require("node:dns"));
const node_net_1 = __importDefault(require("node:net"));
const pg_1 = require("pg");
// Construction identique au client officiel (`pg.ConnectionParameters`).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ConnectionParameters = require("pg/lib/connection-parameters");
function lookupIpv4Sync(hostname) {
    return node_dns_1.default.lookupSync(hostname, { family: 4 }).address;
}
function sslForIpTarget(cpSsl, dnsHost) {
    if (cpSsl == null || cpSsl === false)
        return undefined;
    if (cpSsl === true)
        return { rejectUnauthorized: true, servername: dnsHost };
    if (typeof cpSsl === "object")
        return {
            ...cpSsl,
            servername: cpSsl.servername ?? dnsHost,
        };
    return cpSsl;
}
/**
 * Rend une config de pool où l’hôte DNS est résolu en IPv4 (lookupSync `{ family: 4 }`).
 * Utile sur Render : la route IPv6 vers Supabase peut renvoyer ENETUNREACH.
 * Pour TLS avec une IP comme cible, on force servername au nom canonique pour le SNI.
 */
function poolConfigPreferIpv4(connectionString) {
    const cp = new ConnectionParameters(connectionString);
    const host = cp.host ?? "";
    if (!host ||
        cp.isDomainSocket ||
        host.startsWith("/") ||
        node_net_1.default.isIP(host) !== 0) {
        return { connectionString };
    }
    try {
        const ipv4 = lookupIpv4Sync(host);
        const portNum = typeof cp.port === "string" ? parseInt(cp.port, 10) : Number(cp.port);
        const port = typeof portNum === "number" && !Number.isNaN(portNum) ? portNum : 5432;
        const ssl = sslForIpTarget(cp.ssl, host);
        const password = cp.password ?? undefined;
        const config = {
            host: ipv4,
            port,
            user: cp.user ?? undefined,
            database: cp.database ?? undefined,
            ...(password !== undefined ? { password } : {}),
            ...(ssl !== undefined ? { ssl } : {}),
            ...(cp.options != null ? { options: cp.options } : {}),
            ...(cp.application_name != null
                ? { application_name: cp.application_name }
                : {}),
            ...(cp.replication != null ? { replication: cp.replication } : {}),
        };
        return config;
    }
    catch {
        return { connectionString };
    }
}
function prismaPgPoolFromDatabaseUrl(url) {
    return new pg_1.Pool(poolConfigPreferIpv4(url));
}
