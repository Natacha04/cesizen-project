import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return "Non autorisé";
  if ((session.user as { role: string }).role !== "ADMIN") return "Accès refusé";
  return null;
};

export const GET = async () => {
  const err = await requireAdmin();
  if (err) return NextResponse.json({ error: err }, { status: err === "Non autorisé" ? 401 : 403 });

  const subEmotions = await prisma.subEmotion.findMany({ orderBy: [{ kind: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ subEmotions });
};

export const POST = async (req: Request) => {
  const err = await requireAdmin();
  if (err) return NextResponse.json({ error: err }, { status: err === "Non autorisé" ? 401 : 403 });

  const { label, kind } = await req.json();
  if (!label || !kind) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const subEmotion = await prisma.subEmotion.create({ data: { label, kind } });
  return NextResponse.json({ subEmotion }, { status: 201 });
};
