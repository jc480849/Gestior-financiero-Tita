import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const metodos = await prisma.metodoPago.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(metodos);
}
