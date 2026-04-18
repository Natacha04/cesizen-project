import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  try {
    const ressources = await prisma.ressource.findMany({
      include: { user: true },
    });
    return NextResponse.json({ ressources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec de la récupération des ressources", details: message },
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

    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const { title, content, imageUrl, readingTime } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Titre invalide ou manquant" }, { status: 400 });
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Contenu invalide ou manquant" }, { status: 400 });
    }

    if (!readingTime || typeof readingTime !== "number") {
      return NextResponse.json({ error: "Durée de lecture invalide ou manquante" }, { status: 400 });
    }

    const newRessource = await prisma.ressource.create({
      data: {
        title,
        content,
        imageUrl: imageUrl ?? null,
        readingTime,
        userId: user.id,
      },
    });

    return NextResponse.json({ ressource: newRessource }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec de la création de la ressource", details: message },
      { status: 500 }
    );
  }
};

