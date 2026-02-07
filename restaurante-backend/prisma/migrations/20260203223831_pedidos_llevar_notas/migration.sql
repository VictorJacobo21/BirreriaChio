-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('MESA', 'LLEVAR');

-- AlterTable
ALTER TABLE "ItemPedido" ADD COLUMN     "nota" TEXT;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "impreso" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "impresoEn" TIMESTAMP(3),
ADD COLUMN     "imprimirTicket" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombreCliente" TEXT,
ADD COLUMN     "tipo" "TipoPedido" NOT NULL DEFAULT 'MESA';
