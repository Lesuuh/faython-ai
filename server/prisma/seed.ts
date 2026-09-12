import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@faython.app" },
    update: {},
    create: {
      id: randomUUID(),
      email: "admin@faython.app",
      name: "Faython Admin",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("seeded admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());