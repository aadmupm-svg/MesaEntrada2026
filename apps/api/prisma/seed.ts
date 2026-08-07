import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const USUARIO = process.env.SEED_USUARIO ?? "admin";
const PASSWORD = process.env.SEED_PASSWORD ?? "admin123";

async function main() {
  const existe = await prisma.usuario.findUnique({ where: { usuario: USUARIO } });

  if (existe) {
    console.log(`El usuario "${USUARIO}" ya existe, se omite el seed`);
    return;
  }

  const pass = await bcrypt.hash(PASSWORD, 10);

  await prisma.usuario.create({
    data: { usuario: USUARIO, pass },
  });

  console.log(`Usuario "${USUARIO}" creado correctamente`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
