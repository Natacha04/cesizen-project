"use client";

import * as React from "react";
import dayjs from "dayjs";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";
import { FluentEmoji } from "@lobehub/fluent-emoji";
import { EmotionKind, EMOTION_COLORS, EMOTION_EMOJIS, EMOTION_LABELS } from "@/shared/constants/emotions";

const ALL_KINDS: EmotionKind[] = ["surprise", "anger", "sadness", "fear", "joy", "disgust"];

type EmotionTrackerPageProps = {
  date?: string;
};

export function EmotionTrackerPage({ date }: EmotionTrackerPageProps) {
  const parsedDate = date && dayjs(date).isValid() ? dayjs(date) : dayjs();
  const [selectedEmotion, setSelectedEmotion] = React.useState<EmotionKind>("surprise");
  const [selectedSubEmotion, setSelectedSubEmotion] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"emotion" | "subEmotion">("emotion");
  const [error, setError] = React.useState("");
  const [subEmotions, setSubEmotions] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch(`/api/sub-emotions?kind=${selectedEmotion}`)
      .then((res) => res.json())
      .then((data) => setSubEmotions((data.subEmotions ?? []).map((s: { label: string }) => s.label)));
  }, [selectedEmotion]);

  const handleFinalValidation = async () => {
    const res = await fetch("/api/emotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: parsedDate.toISOString(), kind: selectedEmotion, subEmotion: selectedSubEmotion }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    window.location.href = "/";
  };

  const btnStyle = {
    minWidth: 140, px: 3, py: 1.15, borderRadius: "999px", textTransform: "none" as const,
    fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" },
    "&.Mui-disabled": { backgroundColor: "rgba(36,95,66,0.35)", color: "rgba(255,255,255,0.82)" },
  };

  return (
    <>
      <PublicHeader />
      <Box sx={{ width: "min(100%, 420px)", mx: "auto", mt: { xs: 15, lg: 10 }, px: { xs: 1.5, sm: 0 }, pb: { xs: 14, lg: 6 } }}>
        <Paper elevation={0} sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 3.25, sm: 3.5 }, borderRadius: "26px", border: "1px solid rgba(20,35,26,0.06)", backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 18px 40px rgba(33,54,42,0.14)" }}>
          <Stack spacing={3.25} alignItems="center">
            {step === "emotion" ? (
              <>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body1" sx={{ color: "#101418", fontWeight: 700, fontSize: "1.35rem" }}>
                    Comment tu te sens aujourd&apos;hui ?
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 0.75, color: "#6d7a86" }}>
                    {parsedDate.format("DD/MM/YYYY")}
                  </Typography>
                </Box>

                <Stack spacing={1.25} alignItems="center">
                  <FluentEmoji emoji={EMOTION_EMOJIS[selectedEmotion]} size={136} />
                  <Typography variant="h6" sx={{ color: EMOTION_COLORS[selectedEmotion], fontWeight: 700 }}>
                    {EMOTION_LABELS[selectedEmotion]}
                  </Typography>
                </Stack>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 2, width: "100%", maxWidth: 210 }}>
                  {ALL_KINDS.map((kind) => (
                    <ButtonBase
                      key={kind}
                      onClick={() => setSelectedEmotion(kind)}
                      sx={{
                        width: 52, height: 52, justifySelf: "center", borderRadius: "16px",
                        backgroundColor: selectedEmotion === kind ? `${EMOTION_COLORS[kind]}20` : `${EMOTION_COLORS[kind]}10`,
                        border: selectedEmotion === kind ? `2px solid ${EMOTION_COLORS[kind]}` : "1px solid rgba(17,24,39,0.08)",
                        boxShadow: selectedEmotion === kind ? `0 10px 22px ${EMOTION_COLORS[kind]}30` : "0 7px 16px rgba(31,41,55,0.16)",
                        transition: "transform 140ms ease",
                        "&:hover": { transform: "translateY(-1px)" },
                      }}
                    >
                      <Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: "12px", backgroundColor: `${EMOTION_COLORS[kind]}1c` }}>
                        <FluentEmoji emoji={EMOTION_EMOJIS[kind]} size={30} />
                      </Box>
                    </ButtonBase>
                  ))}
                </Box>

                <Button variant="contained" disableElevation onClick={() => { setSelectedSubEmotion(null); setStep("subEmotion"); }} sx={btnStyle}>
                  Validation
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ color: "#101418", fontWeight: 700, display: "inline-flex", pb: 0.5, borderBottom: `3px solid ${EMOTION_COLORS[selectedEmotion]}` }}>
                    {EMOTION_LABELS[selectedEmotion]}
                  </Typography>
                </Box>

                <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 230 }}>
                  {subEmotions.map((sub) => (
                    <ButtonBase
                      key={sub}
                      onClick={() => setSelectedSubEmotion(sub)}
                      sx={{
                        width: "100%", borderRadius: "18px", px: 2.5, py: 1.35,
                        backgroundColor: selectedSubEmotion === sub ? `${EMOTION_COLORS[selectedEmotion]}18` : "#ffffff",
                        border: selectedSubEmotion === sub ? `1px solid ${EMOTION_COLORS[selectedEmotion]}` : "1px solid rgba(17,24,39,0.06)",
                        boxShadow: "0 7px 16px rgba(31,41,55,0.14)",
                      }}
                    >
                      <Typography sx={{ width: "100%", textAlign: "center", color: "#101418", fontWeight: 600 }}>
                        {sub}
                      </Typography>
                    </ButtonBase>
                  ))}
                </Stack>

                {error && <Alert severity="error" sx={{ width: "100%", borderRadius: "12px" }}>{error}</Alert>}

                <Button variant="contained" disableElevation disabled={!selectedSubEmotion} onClick={handleFinalValidation} sx={btnStyle}>
                  Validation
                </Button>

                <Button variant="text" onClick={() => setStep("emotion")} sx={{ textTransform: "none", color: "#52616d" }}>
                  Retour
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
