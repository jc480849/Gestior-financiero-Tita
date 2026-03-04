import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const config = await prisma.configuracionFinanciera.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json();
  const config = await prisma.configuracionFinanciera.upsert({
    where: { userId },
    update: body,
    create: { userId, ...body },
  });
  return NextResponse.json(config);
}
