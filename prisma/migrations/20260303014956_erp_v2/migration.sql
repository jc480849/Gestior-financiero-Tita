/*
  Warnings:

  - You are about to drop the `Gasto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ingreso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Presupuesto` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'GASTO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('EFECTIVO', 'AHORRO', 'CORRIENTE', 'INVERSION', 'CREDITO');

-- CreateEnum
CREATE TYPE "TipoDeuda" AS ENUM ('DEUDA_PROPIA', 'DEUDA_AJENA');

-- CreateEnum
CREATE TYPE "TipoActivo" AS ENUM ('EFECTIVO', 'INVERSION', 'BIEN_RAIZ', 'VEHICULO', 'NEGOCIO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('AHORRO', 'RETIRO', 'EMERGENCIA', 'VIAJE', 'OTRO');

-- CreateEnum
CREATE TYPE "EstrategiaDeuda" AS ENUM ('SNOWBALL', 'AVALANCHE');

-- DropTable
DROP TABLE "Gasto";

-- DropTable
DROP TABLE "Ingreso";

-- DropTable
DROP TABLE "Presupuesto";

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "icono" TEXT,
    "color" TEXT,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuenta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moneda" TEXT NOT NULL DEFAULT 'COP',

    CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetodoPago" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "MetodoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaccion" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriaId" INTEGER NOT NULL,
    "cuentaId" INTEGER,
    "metodoPagoId" INTEGER,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresupuestoCategoria" (
    "id" SERIAL NOT NULL,
    "mes" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresupuestoCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deuda" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDeuda" NOT NULL,
    "montoOriginal" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL,
    "tasaInteres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cuotaMensual" DOUBLE PRECISION,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "estrategia" "EstrategiaDeuda" NOT NULL DEFAULT 'AVALANCHE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoDeuda" (
    "id" SERIAL NOT NULL,
    "deudaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,

    CONSTRAINT "PagoDeuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoActivo" NOT NULL,
    "valorActual" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialActivo" (
    "id" SERIAL NOT NULL,
    "activoId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialActivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaFinanciera" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoMeta" NOT NULL,
    "montoMeta" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaMeta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaFinanciera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionFinanciera" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombreUsuario" TEXT NOT NULL DEFAULT 'Usuario',
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "tasaRetornoEsperada" DOUBLE PRECISION NOT NULL DEFAULT 0.07,
    "tasaInflacion" DOUBLE PRECISION NOT NULL DEFAULT 0.04,
    "edadActual" INTEGER,
    "edadRetiro" INTEGER,
    "gastoMensualDeseado" DOUBLE PRECISION,

    CONSTRAINT "ConfiguracionFinanciera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cuenta_nombre_key" ON "Cuenta"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "MetodoPago_nombre_key" ON "MetodoPago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PresupuestoCategoria_mes_categoriaId_key" ON "PresupuestoCategoria"("mes", "categoriaId");

-- AddForeignKey
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresupuestoCategoria" ADD CONSTRAINT "PresupuestoCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialActivo" ADD CONSTRAINT "HistorialActivo_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "Activo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
