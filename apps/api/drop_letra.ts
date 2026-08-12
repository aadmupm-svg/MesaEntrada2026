import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.js";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Nota" DROP COLUMN IF EXISTS "letra";');
    console.log("OK: columna letra eliminada");
  } catch (e) {
    console.error("ERROR:", (e as Error).message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();