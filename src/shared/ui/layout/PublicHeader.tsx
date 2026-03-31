import { PublicHeaderDesktop } from "@/shared/ui/layout/PublicHeaderDesktop";
import { PublicHeaderMobile } from "@/shared/ui/layout/PublicHeaderMobile";

export function PublicHeader() {
  return (
    <>
      <PublicHeaderDesktop />
      <PublicHeaderMobile />
    </>
  );
}
