"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { FluentEmoji } from "@lobehub/fluent-emoji";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";
import { EMOTION_COLORS, EMOTION_EMOJIS, EMOTION_LABELS, type EmotionKind } from "@/shared/constants/emotions";

const ALL_KINDS: EmotionKind[] = ["surprise", "anger", "sadness", "fear", "joy", "disgust"];

type SubEmotion = { id: string; label: string; kind: string };

export function EmotionAdminPage() {
  const router = useRouter();
  const [selectedKind, setSelectedKind] = React.useState<EmotionKind>("joy");
  const [subEmotions, setSubEmotions] = React.useState<SubEmotion[]>([]);
  const [newLabel, setNewLabel] = React.useState("");

  const fetchSubEmotions = React.useCallback(() => {
    fetch("/api/admin/sub-emotions")
      .then((res) => res.json())
      .then((data) => setSubEmotions(data.subEmotions ?? []));
  }, []);

  React.useEffect(() => { fetchSubEmotions(); }, [fetchSubEmotions]);

  const filtered = subEmotions.filter((s) => s.kind === selectedKind);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    await fetch("/api/admin/sub-emotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim(), kind: selectedKind }),
    });
    setNewLabel("");
    fetchSubEmotions();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/sub-emotions/${id}`, { method: "DELETE" });
    fetchSubEmotions();
  };

  const color = EMOTION_COLORS[selectedKind];

  return (
    <>
      <PublicHeader />
      <Box
        sx={{
          width: "min(100%, 680px)",
          mx: "auto",
          mt: { xs: 16, lg: 10 },
          px: { xs: 2, sm: 0 },
          pb: { xs: 14, lg: 6 },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="text" onClick={() => router.push("/admin")} sx={{ textTransform: "none", color: "#52616d" }}>
              Articles
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}>
              Émotions
            </Button>
            <Button variant="text" onClick={() => router.push("/admin/users")} sx={{ textTransform: "none", color: "#52616d" }}>
              Utilisateurs
            </Button>
          </Stack>

          {/* Sélecteur d'émotion principale */}
          <Paper
            elevation={0}
            sx={{ px: { xs: 2, sm: 3 }, py: 3, borderRadius: "28px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", backdropFilter: "blur(16px)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}
          >
            <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}>
              Émotion principale
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              {ALL_KINDS.map((kind) => (
                <ButtonBase
                  key={kind}
                  onClick={() => setSelectedKind(kind)}
                  sx={{
                    borderRadius: "16px",
                    px: 2, py: 1,
                    border: selectedKind === kind ? `2px solid ${EMOTION_COLORS[kind]}` : "1.5px solid rgba(17,24,39,0.08)",
                    backgroundColor: selectedKind === kind ? `${EMOTION_COLORS[kind]}18` : "transparent",
                    gap: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FluentEmoji emoji={EMOTION_EMOJIS[kind]} size={28} />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: selectedKind === kind ? EMOTION_COLORS[kind] : "#1f2933" }}>
                    {EMOTION_LABELS[kind]}
                  </Typography>
                </ButtonBase>
              ))}
            </Stack>
          </Paper>

          {/* Ajouter une sous-émotion */}
          <Paper
            elevation={0}
            sx={{ px: { xs: 2, sm: 3 }, py: 3, borderRadius: "28px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", backdropFilter: "blur(16px)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}
          >
            <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}>
              Ajouter une sous-émotion — {EMOTION_LABELS[selectedKind]}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <TextField
                size="small"
                placeholder="Nouvelle sous-émotion"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                fullWidth
              />
              <Button
                variant="contained"
                disabled={!newLabel.trim()}
                onClick={handleAdd}
                sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}
              >
                Ajouter
              </Button>
            </Stack>
          </Paper>

          {/* Liste des sous-émotions */}
          <Paper
            elevation={0}
            sx={{ borderRadius: "24px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", backdropFilter: "blur(16px)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)", overflow: "hidden" }}
          >
            <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em", px: 3, pt: 3, display: "block" }}>
              Sous-émotions de {EMOTION_LABELS[selectedKind]} ({filtered.length})
            </Typography>

            {filtered.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#52616d", p: 3 }}>
                Aucune sous-émotion pour l&apos;instant.
              </Typography>
            ) : (
              <Stack divider={<Divider />} sx={{ mt: 1 }}>
                {filtered.map((sub) => (
                  <Stack
                    key={sub.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 3, py: 1.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1f2933" }}>
                        {sub.label}
                      </Typography>
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDelete(sub.id)}
                      sx={{ textTransform: "none", borderRadius: "999px", borderColor: "#c0392b", color: "#c0392b" }}
                    >
                      Supprimer
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </>
  );
}
