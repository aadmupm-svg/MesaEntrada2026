-- AlterTable
ALTER TABLE "Nota" ADD COLUMN     "anio" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Nota_numero_anio_key" ON "Nota"("numero", "anio");

