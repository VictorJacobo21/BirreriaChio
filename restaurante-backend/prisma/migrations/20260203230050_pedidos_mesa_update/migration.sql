-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_mesaId_fkey";

-- AlterTable
ALTER TABLE "Pedido" ALTER COLUMN "mesaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
