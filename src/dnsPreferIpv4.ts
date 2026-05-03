import dns from "node:dns";

/**
 * Render (et certains autres clouds) ne routent pas correctement IPv6 vers Supabase.
 * Sans cela, `pg` peut tenter une socket vers une AAAA (ENETUNREACH) au lieu du A (IPv4).
 */
dns.setDefaultResultOrder("ipv4first");
