-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PREPARACION', 'LISTO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Mesa" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "estado" "EstadoPedido" NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mesaId" INTEGER NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_numero_key" ON "Mesa"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_nombre_key" ON "Producto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPedido_pedidoId_productoId_key" ON "ItemPedido"("pedidoId", "productoId");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
