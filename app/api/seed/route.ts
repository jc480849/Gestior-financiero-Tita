import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoMovimiento, TipoCuenta } from "@prisma/client";

export async function POST() {
  // Categorías de gasto
  const categoriasGasto = [
    { nombre: "Alimentación", tipo: TipoMovimiento.GASTO, icono: "🍔", color: "#f97316" },
    { nombre: "Transporte", tipo: TipoMovimiento.GASTO, icono: "🚌", color: "#3b82f6" },
    { nombre: "Vivienda", tipo: TipoMovimiento.GASTO, icono: "🏠", color: "#8b5cf6" },
    { nombre: "Salud", tipo: TipoMovimiento.GASTO, icono: "💊", color: "#ef4444" },
    { nombre: "Educación", tipo: TipoMovimiento.GASTO, icono: "📚", color: "#06b6d4" },
    { nombre: "Entretenimiento", tipo: TipoMovimiento.GASTO, icono: "🎬", color: "#ec4899" },
    { nombre: "Ropa", tipo: TipoMovimiento.GASTO, icono: "👕", color: "#f59e0b" },
    { nombre: "Servicios", tipo: TipoMovimiento.GASTO, icono: "⚡", color: "#10b981" },
    { nombre: "Otros Gastos", tipo: TipoMovimiento.GASTO, icono: "📦", color: "#6b7280" },
  ];

  const categoriasIngreso = [
    { nombre: "Salario", tipo: TipoMovimiento.INGRESO, icono: "💼", color: "#22c55e" },
    { nombre: "Freelance", tipo: TipoMovimiento.INGRESO, icono: "💻", color: "#84cc16" },
    { nombre: "Negocio", tipo: TipoMovimiento.INGRESO, icono: "🏢", color: "#eab308" },
    { nombre: "Inversiones", tipo: TipoMovimiento.INGRESO, icono: "📈", color: "#14b8a6" },
    { nombre: "Regalo", tipo: TipoMovimiento.INGRESO, icono: "🎁", color: "#a855f7" },
    { nombre: "Otros Ingresos", tipo: TipoMovimiento.INGRESO, icono: "💰", color: "#64748b" },
  ];

  for (const cat of [...categoriasGasto, ...categoriasIngreso]) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
  }

  const cuentas = [
    { nombre: "Efectivo", tipo: TipoCuenta.EFECTIVO },
    { nombre: "Ahorro", tipo: TipoCuenta.AHORRO },
    { nombre: "Cuenta Corriente", tipo: TipoCuenta.CORRIENTE },
  ];
  for (const cuenta of cuentas) {
    await prisma.cuenta.upsert({ where: { nombre: cuenta.nombre }, update: {}, create: cuenta });
  }

  const metodos = ["Efectivo", "Débito", "Crédito", "Transferencia", "Nequi", "Daviplata"];
  for (const nombre of metodos) {
    await prisma.metodoPago.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }

  await prisma.configuracionFinanciera.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return NextResponse.json({ ok: true, mensaje: "Seed completado" });
}
