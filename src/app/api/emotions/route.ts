import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const emotions = await prisma.emotionEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ emotions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec de la récupération des émotions", details: message },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { date, kind, subEmotion } = await req.json();

    if (!date || !kind || !subEmotion) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const entry = await prisma.emotionEntry.create({
      data: {
        date: new Date(date),
        kind,
        subEmotion,
        userId,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec de l'enregistrement", details: message },
      { status: 500 }
    );
  }
};
