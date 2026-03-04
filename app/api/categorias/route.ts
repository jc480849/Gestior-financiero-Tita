import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  const categorias = await prisma.categoria.findMany({
    where: {
      userId,
      ...(tipo ? { tipo: tipo as "INGRESO" | "GASTO" | "TRANSFERENCIA" } : {}),
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(categorias);
}
