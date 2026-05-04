"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dbConnectionString_1 = require("./dbConnectionString");
const pgPoolIpv4_1 = require("./pgPoolIpv4");
const databaseUrl = (0, dbConnectionString_1.getDatabaseUrlForRuntime)(process.env.DATABASE_URL);
// On utilise l’instance existante si elle existe (dev), sinon on crée un nouveau client
exports.prisma = globalThis.prisma ||
    new prisma_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg((0, pgPoolIpv4_1.prismaPgPoolFromDatabaseUrl)(databaseUrl)),
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
// En développement, on attache l’instance au global pour la réutiliser
if (process.env.NODE_ENV === "production") {
    globalThis.prisma = exports.prisma;
}
exports.default = exports.prisma;
