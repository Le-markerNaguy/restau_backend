"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
/**
 * Render (et certains autres clouds) ne routent pas correctement IPv6 vers Supabase.
 * Sans cela, `pg` peut tenter une socket vers une AAAA (ENETUNREACH) au lieu du A (IPv4).
 */
node_dns_1.default.setDefaultResultOrder("ipv4first");
