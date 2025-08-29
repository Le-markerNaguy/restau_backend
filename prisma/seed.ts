import { prisma } from "../src/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("superadmin2025", 10);

  await prisma.admin.create({
    data: {
      email: "superadmin@gmail.com",
      password: hashedPassword,
      role: "SUPERADMIN",
    },
  });

  console.log("✅ SuperAdmin créé !");
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
