-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable (FK hacia Nota: al borrar usuario, sus notas quedan sin referencia)
ALTER TABLE "Nota" DROP CONSTRAINT IF EXISTS "Nota_usuarioId_fkey";
ALTER TABLE "Nota"
  ADD CONSTRAINT "Nota_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
