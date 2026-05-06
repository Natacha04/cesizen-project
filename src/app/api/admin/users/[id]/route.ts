import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: "Non autorisé", status: 401 };
  if ((session.user as { role: string }).role !== "ADMIN") return { err: "Accès refusé", status: 403 };
  return null;
};

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const check = await requireAdmin();
  if (check) return NextResponse.json({ error: check.err }, { status: check.status });

  const { id } = await params;
  const { isActive, role } = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof isActive === "boolean") data.isActive = isActive;
  if (role === "ADMIN" || role === "USER") data.role = role;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });

  return NextResponse.json({ user });
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const check = await requireAdmin();
  if (check) return NextResponse.json({ error: check.err }, { status: check.status });

  const session = await getServerSession(authOptions);
  const { id } = await params;

  if ((session!.user as { id: string }).id === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
};
