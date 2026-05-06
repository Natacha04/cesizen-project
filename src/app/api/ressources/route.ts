import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ resources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const userId = (session.user as { id: string }).id;
    const { title, content, imageUrl, readingTime } = await req.json();

    if (!title || !content || !readingTime) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: { title, content, imageUrl: imageUrl || null, readingTime: Number(readingTime), userId },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
};
