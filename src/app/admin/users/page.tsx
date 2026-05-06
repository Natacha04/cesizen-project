import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserAdminPage } from "@/features/admin/views/UserAdminPage";

export default async function AdminUsersRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "ADMIN") redirect("/");

  return <UserAdminPage />;
}
