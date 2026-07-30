import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`register:${ip}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  }

  const { firstName, lastName, email, password } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { firstName, lastName, email, password: hashedPassword },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
