import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ResourceAdminPage } from "@/features/admin/views/ResourceAdminPage";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "ADMIN") redirect("/");

  return <ResourceAdminPage />;
}
