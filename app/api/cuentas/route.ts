import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cuentas = await prisma.cuenta.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(cuentas);
}
