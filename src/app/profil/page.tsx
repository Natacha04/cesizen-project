import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProfilePage } from "@/features/profile/views/ProfilePage";

export default async function ProfilRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  return <ProfilePage />;
}
