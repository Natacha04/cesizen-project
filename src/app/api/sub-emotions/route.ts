import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");

  const subEmotions = await prisma.subEmotion.findMany({
    where: kind ? { kind } : undefined,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ subEmotions });
};
