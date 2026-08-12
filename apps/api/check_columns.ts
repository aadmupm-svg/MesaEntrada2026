import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.js";

async function main() {
  const p = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const cols: Array<{ column_name: string }> = await p.$queryRawUnsafe(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'Nota'"
  );
  console.log("Columnas Nota:", cols.map((c) => c.column_name).join(", "));
  await p.$disconnect();
}

main();