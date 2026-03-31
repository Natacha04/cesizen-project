import { EmotionTrackerPage } from "@/features/emotions/views/EmotionTrackerPage";

type EmotionTrackerRouteProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function EmotionTrackerRoute({
  searchParams,
}: EmotionTrackerRouteProps) {
  const { date } = await searchParams;

  return <EmotionTrackerPage date={date} />;
}
