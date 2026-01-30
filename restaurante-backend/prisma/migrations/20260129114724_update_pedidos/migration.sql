-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "metodoPago" "MetodoPago",
ADD COLUMN     "pagadoEn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Combo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboItem" (
    "id" SERIAL NOT NULL,
    "comboId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "pedidoId" INTEGER,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComboItem_comboId_productoId_key" ON "ComboItem"("comboId", "productoId");

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
