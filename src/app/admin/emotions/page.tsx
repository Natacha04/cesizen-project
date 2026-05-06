import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EmotionAdminPage } from "@/features/admin/views/EmotionAdminPage";

export default async function AdminEmotionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "ADMIN") redirect("/");

  return <EmotionAdminPage />;
}
