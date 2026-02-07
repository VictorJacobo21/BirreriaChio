/*
  Warnings:

  - You are about to drop the column `nota` on the `ItemPedido` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItemPedido" DROP COLUMN "nota";

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "nota" TEXT;
