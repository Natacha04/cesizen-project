import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
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

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
};

export const POST = async (req: Request) => {
  const err = await requireAdmin();
  if (err) return NextResponse.json({ error: err }, { status: err === "Non autorisé" ? 401 : 403 });

  const { firstName, lastName, email, password, role } = await req.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "USER",
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
};
