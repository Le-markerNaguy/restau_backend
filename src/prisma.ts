import { PrismaClient } from "../generated/prisma";

declare global {
  // On ajoute une propriété sur le global pour TypeScript
  // afin qu'il ne se plaigne pas quand on l'utilise
  var prisma: PrismaClient | undefined;
}

// On utilise l’instance existante si elle existe (dev), sinon on crée un nouveau client
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
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
