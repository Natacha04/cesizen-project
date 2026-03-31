import { EmotionCalendar } from "@/features/emotions/views/EmotionCalendar";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

export function HomePage() {
  return (
    <>
      <PublicHeader />
      <EmotionCalendar />
    </>
  );
}
