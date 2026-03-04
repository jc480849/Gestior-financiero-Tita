import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const metas = await prisma.metaFinanciera.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(metas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nombre, tipo, montoMeta, montoActual, fechaMeta } = body;

  const meta = await prisma.metaFinanciera.create({
    data: {
      nombre,
      tipo,
      montoMeta: parseFloat(montoMeta),
      montoActual: montoActual ? parseFloat(montoActual) : 0,
      fechaMeta: fechaMeta ? new Date(fechaMeta) : null,
    },
  });

  return NextResponse.json(meta, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const body = await request.json();
  const meta = await prisma.metaFinanciera.update({
    where: { id: parseInt(id) },
    data: body,
  });

  return NextResponse.json(meta);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.metaFinanciera.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
