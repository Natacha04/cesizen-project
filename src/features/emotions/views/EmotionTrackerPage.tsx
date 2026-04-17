"use client";

import * as React from "react";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Image, { StaticImageData } from "next/image";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";
import { EmotionKind, EMOTION_COLORS, EMOTION_LABELS } from "@/shared/constants/emotions";
import angerImage from "@/app/public/emotions/colere.svg";
import disgustImage from "@/app/public/emotions/degout.svg";
import joyImage from "@/app/public/emotions/joie.svg";
import fearImage from "@/app/public/emotions/peur.svg";
import surpriseImage from "@/app/public/emotions/surprise.svg";
import sadnessImage from "@/app/public/emotions/tristesse.svg";

type EmotionOption = {
  value: EmotionKind;
  label: string;
  color: string;
  image: StaticImageData;
  subEmotions: string[];
};

type EmotionTrackerPageProps = {
  date?: string;
};

const emotionOptions: EmotionOption[] = [
  {
    value: "surprise",
    label: EMOTION_LABELS.surprise,
    color: EMOTION_COLORS.surprise,
    image: surpriseImage,
    subEmotions: [
      "Etonnement",
      "Stupeur",
      "Choc",
      "Curiosite",
      "Emerveillement",
      "Confusion",
    ],
  },
  {
    value: "anger",
    label: EMOTION_LABELS.anger,
    color: EMOTION_COLORS.anger,
    image: angerImage,
    subEmotions: [
      "Irritation",
      "Frustration",
      "Agacement",
      "Rage",
      "Impatience",
      "Resentiment",
    ],
  },
  {
    value: "sadness",
    label: EMOTION_LABELS.sadness,
    color: EMOTION_COLORS.sadness,
    image: sadnessImage,
    subEmotions: [
      "Chagrin",
      "Deception",
      "Solitude",
      "Abattement",
      "Nostalgie",
      "Melancolie",
    ],
  },
  {
    value: "fear",
    label: EMOTION_LABELS.fear,
    color: EMOTION_COLORS.fear,
    image: fearImage,
    subEmotions: [
      "Inquietude",
      "Anxiete",
      "Terreur",
      "Apprehension",
      "Panique",
      "Crainte",
    ],
  },
  {
    value: "joy",
    label: EMOTION_LABELS.joy,
    color: EMOTION_COLORS.joy,
    image: joyImage,
    subEmotions: [
      "Soulagement",
      "Contentement",
      "Fierte",
      "Gratitude",
      "Enthousiasme",
      "Euphorie",
    ],
  },
  {
    value: "disgust",
    label: EMOTION_LABELS.disgust,
    color: EMOTION_COLORS.disgust,
    image: disgustImage,
    subEmotions: [
      "Rejet",
      "Aversion",
      "Repulsion",
      "Ecoeurement",
      "Malaise",
      "Degout profond",
    ],
  },
];

export function EmotionTrackerPage({ date }: EmotionTrackerPageProps) {
  const parsedDate = date && dayjs(date).isValid() ? dayjs(date) : dayjs();
  const [selectedEmotion, setSelectedEmotion] = React.useState<EmotionKind>("surprise");
  const [selectedSubEmotion, setSelectedSubEmotion] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"emotion" | "subEmotion">("emotion");

  const selectedOption = React.useMemo(
    () =>
      emotionOptions.find((emotion) => emotion.value === selectedEmotion) ??
      emotionOptions[0],
    [selectedEmotion],
  );

  const handlePrimaryValidation = () => {
    setSelectedSubEmotion(null);
    setStep("subEmotion");
  };

  return (
    <>
      <PublicHeader />

      <Box
        sx={{
          width: "min(100%, 420px)",
          mx: "auto",
          mt: { xs: 15, lg: 10 },
          px: { xs: 1.5, sm: 0 },
          pb: { xs: 14, lg: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2.25, sm: 3 },
            py: { xs: 3.25, sm: 3.5 },
            borderRadius: "26px",
            border: "1px solid rgba(20, 35, 26, 0.06)",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 18px 40px rgba(33, 54, 42, 0.14)",
          }}
        >
          <Stack spacing={3.25} alignItems="center">
            {step === "emotion" ? (
              <>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body1"
                    sx={{ color: "#101418", fontWeight: 700, fontSize: "1.35rem" }}
                  >
                    Comment tu te sens aujourd&apos;hui ?
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 0.75, color: "#6d7a86" }}>
                    {parsedDate.format("DD/MM/YYYY")}
                  </Typography>
                </Box>

                <Stack spacing={1.25} alignItems="center">
                  <Image
                    src={selectedOption.image}
                    alt={selectedOption.label}
                    width={136}
                    height={136}
                    priority
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: selectedOption.color,
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    {selectedOption.label}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 2,
                    width: "100%",
                    maxWidth: 210,
                  }}
                >
                  {emotionOptions.map((emotion) => (
                    <ButtonBase
                      key={emotion.value}
                      onClick={() => setSelectedEmotion(emotion.value)}
                      sx={{
                        width: 52,
                        height: 52,
                        justifySelf: "center",
                        borderRadius: "16px",
                        backgroundColor:
                          selectedEmotion === emotion.value
                            ? `${emotion.color}20`
                            : `${emotion.color}10`,
                        border:
                          selectedEmotion === emotion.value
                            ? `2px solid ${emotion.color}`
                            : "1px solid rgba(17, 24, 39, 0.08)",
                        boxShadow:
                          selectedEmotion === emotion.value
                            ? `0 10px 22px ${emotion.color}30`
                            : "0 7px 16px rgba(31, 41, 55, 0.16)",
                        transition: "transform 140ms ease, box-shadow 140ms ease",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 10px 20px rgba(31, 41, 55, 0.2)",
                        },
                      }}
                      >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "12px",
                          backgroundColor: `${emotion.color}1c`,
                        }}
                      >
                        <Image
                          src={emotion.image}
                          alt={emotion.label}
                          width={30}
                          height={30}
                        />
                      </Box>
                    </ButtonBase>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  disableElevation
                  onClick={handlePrimaryValidation}
                  sx={{
                    minWidth: 140,
                    px: 3,
                    py: 1.15,
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#245f42",
                    "&:hover": {
                      backgroundColor: "#1e5138",
                    },
                  }}
                >
                  Validation
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#101418",
                      fontWeight: 700,
                      display: "inline-flex",
                      pb: 0.5,
                      borderBottom: `3px solid ${selectedOption.color}`,
                    }}
                  >
                    {selectedOption.label}
                  </Typography>
                </Box>

                <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 230 }}>
                  {selectedOption.subEmotions.map((subEmotion) => (
                    <ButtonBase
                      key={subEmotion}
                      onClick={() => setSelectedSubEmotion(subEmotion)}
                      sx={{
                        width: "100%",
                        borderRadius: "18px",
                        px: 2.5,
                        py: 1.35,
                        backgroundColor:
                          selectedSubEmotion === subEmotion
                            ? `${selectedOption.color}18`
                            : "#ffffff",
                        border:
                          selectedSubEmotion === subEmotion
                            ? `1px solid ${selectedOption.color}`
                            : "1px solid rgba(17, 24, 39, 0.06)",
                        boxShadow: "0 7px 16px rgba(31, 41, 55, 0.14)",
                      }}
                    >
                      <Typography
                        sx={{
                          width: "100%",
                          textAlign: "center",
                          color: "#101418",
                          fontWeight: 600,
                        }}
                      >
                        {subEmotion}
                      </Typography>
                    </ButtonBase>
                  ))}
                </Stack>

                <Button
                  variant="contained"
                  disableElevation
                  disabled={!selectedSubEmotion}
                  sx={{
                    minWidth: 140,
                    px: 3,
                    py: 1.15,
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#245f42",
                    "&:hover": {
                      backgroundColor: "#1e5138",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(36, 95, 66, 0.35)",
                      color: "rgba(255, 255, 255, 0.82)",
                    },
                  }}
                >
                  Validation
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
