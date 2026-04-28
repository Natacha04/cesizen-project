import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RessourceAdminPage } from "@/features/admin/views/RessourceAdminPage";

export default async function AdminRessourcesRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const user = session.user as { role: string };
  if (user.role !== "ADMIN") redirect("/");

  return <RessourceAdminPage />;
}
