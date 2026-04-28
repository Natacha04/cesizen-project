import { StaticImageData } from "next/image";
import angerImage from "@/app/public/emotions/colere.svg";
import disgustImage from "@/app/public/emotions/degout.svg";
import joyImage from "@/app/public/emotions/joie.svg";
import fearImage from "@/app/public/emotions/peur.svg";
import surpriseImage from "@/app/public/emotions/surprise.svg";
import sadnessImage from "@/app/public/emotions/tristesse.svg";
import { EmotionKind } from "./emotions";

export const EMOTION_IMAGES: Record<EmotionKind, StaticImageData> = {
  anger: angerImage,
  disgust: disgustImage,
  joy: joyImage,
  fear: fearImage,
  surprise: surpriseImage,
  sadness: sadnessImage,
};
