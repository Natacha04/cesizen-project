import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { EmotionTrackerPage } from "@/features/emotions/views/EmotionTrackerPage";

type EmotionTrackerRouteProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function EmotionTrackerRoute({
  searchParams,
}: EmotionTrackerRouteProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { date } = await searchParams;

  return <EmotionTrackerPage date={date} />;
}
