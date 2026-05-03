import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrlForRuntime, normalizeDatabaseUrl } from "../src/dbConnectionString";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: pnpm exec ts-node scripts/create-superadmin.ts <email> <password>");
  process.exit(1);
}

if (!normalizeDatabaseUrl(process.env.DATABASE_URL)) {
  console.error("DATABASE_URL manquant dans .env");
  process.exit(1);
}
const databaseUrl = getDatabaseUrlForRuntime(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.admin.upsert({
    where: { email },
    update: { password: hashed, role: "SUPERADMIN" },
    create: { email, password: hashed, role: "SUPERADMIN" },
  });
  console.log(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
