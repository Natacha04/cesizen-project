export type EmotionKind = "surprise" | "anger" | "sadness" | "fear" | "joy" | "disgust";

export const EMOTION_COLORS: Record<EmotionKind, string> = {
  surprise: "#d97745",
  anger: "#d62828",
  sadness: "#9bb7ff",
  fear: "#6c7178",
  joy: "#f0b429",
  disgust: "#7b9e45",
};

export const EMOTION_EMOJIS: Record<EmotionKind, string> = {
  surprise: "😲",
  anger: "😡",
  sadness: "😔",
  fear: "😰",
  joy: "😊",
  disgust: "🤢",
};

export const EMOTION_LABELS: Record<EmotionKind, string> = {
  surprise: "Surpris",
  anger: "Colère",
  sadness: "Tristesse",
  fear: "Peur",
  joy: "Joie",
  disgust: "Dégoût",
};
