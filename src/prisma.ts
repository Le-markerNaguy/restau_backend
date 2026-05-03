import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrlForRuntime } from "./dbConnectionString";
import { prismaPgPoolFromDatabaseUrl } from "./pgPoolIpv4";

declare global {
  // On ajoute une propriété sur le global pour TypeScript
  // afin qu'il ne se plaigne pas quand on l'utilise
  var prisma: PrismaClient | undefined;
}

const databaseUrl = getDatabaseUrlForRuntime(process.env.DATABASE_URL);

// On utilise l’instance existante si elle existe (dev), sinon on crée un nouveau client
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(prismaPgPoolFromDatabaseUrl(databaseUrl)),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// En développement, on attache l’instance au global pour la réutiliser
if (process.env.NODE_ENV === "production") {
  globalThis.prisma = prisma;
}

export default prisma;
