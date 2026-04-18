import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export const PUT = async (req: Request, { params }: RouteParams) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, imageUrl, readingTime } = await req.json();

    const existing = await prisma.ressource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const updated = await prisma.ressource.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(readingTime && { readingTime }),
      },
    });

    return NextResponse.json({ ressource: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec de la mise à jour", details: message },
      { status: 500 }
    );
  }
};

export const DELETE = async (_req: Request, { params }: RouteParams) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.ressource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    await prisma.ressource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec de la suppression", details: message },
      { status: 500 }
    );
  }
};
