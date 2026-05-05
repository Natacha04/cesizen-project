import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if ((session.user as { role: string }).role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  await prisma.emotionEntry.delete({ where: { id } });

  return NextResponse.json({ success: true });
};
