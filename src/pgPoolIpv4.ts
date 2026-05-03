import dns from "node:dns";
import net from "node:net";
import type tls from "node:tls";
import { Pool, type PoolConfig } from "pg";

// Construction identique au client officiel (`pg.ConnectionParameters`).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ConnectionParameters = require(
  "pg/lib/connection-parameters"
) as new (cfg: string) => Record<string, unknown>;

function lookupIpv4Sync(hostname: string): string {
  return (
    dns as typeof dns & {
      lookupSync(
        hostname: string,
        options: { family: number },
      ): { address: string };
    }
  ).lookupSync(hostname, { family: 4 }).address;
}

function sslForIpTarget(
  cpSsl: unknown,
  dnsHost: string,
): boolean | tls.ConnectionOptions | undefined {
  if (cpSsl == null || cpSsl === false) return undefined;
  if (cpSsl === true)
    return { rejectUnauthorized: true, servername: dnsHost };
  if (typeof cpSsl === "object")
    return {
      ...(cpSsl as tls.ConnectionOptions),
      servername:
        (cpSsl as { servername?: string }).servername ?? dnsHost,
    };
  return cpSsl as boolean | tls.ConnectionOptions;
}

/**
 * Rend une config de pool où l’hôte DNS est résolu en IPv4 (lookupSync `{ family: 4 }`).
 * Utile sur Render : la route IPv6 vers Supabase peut renvoyer ENETUNREACH.
 * Pour TLS avec une IP comme cible, on force servername au nom canonique pour le SNI.
 */
export function poolConfigPreferIpv4(connectionString: string): PoolConfig {
  const cp = new ConnectionParameters(connectionString) as {
    readonly host?: string | null;
    readonly port?: number | string | null;
    readonly user?: string | null;
    readonly database?: string | null;
    readonly password?: string | null;
    readonly ssl?: unknown;
    readonly options?: string | null;
    readonly application_name?: string | null;
    readonly replication?: string | null;
    readonly isDomainSocket: boolean | number;
    readonly binary?: unknown;
  };

  const host = cp.host ?? "";
  if (
    !host ||
    cp.isDomainSocket ||
    host.startsWith("/") ||
    net.isIP(host) !== 0
  ) {
    return { connectionString };
  }

  try {
    const ipv4 = lookupIpv4Sync(host);
    const portNum =
      typeof cp.port === "string" ? parseInt(cp.port, 10) : Number(cp.port);
    const port =
      typeof portNum === "number" && !Number.isNaN(portNum) ? portNum : 5432;

    const ssl = sslForIpTarget(cp.ssl, host);
    const password = cp.password ?? undefined;

    const config: PoolConfig = {
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
  } catch {
    return { connectionString };
  }
}

export function prismaPgPoolFromDatabaseUrl(url: string): Pool {
  return new Pool(poolConfigPreferIpv4(url));
}
