"use client";

import * as React from "react";
import dayjs from "dayjs";
import { FluentEmoji } from "@lobehub/fluent-emoji";
import isoWeek from "dayjs/plugin/isoWeek";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";
import { EmotionKind, EMOTION_COLORS, EMOTION_EMOJIS, EMOTION_LABELS } from "@/shared/constants/emotions";

dayjs.extend(isoWeek);

type PeriodFilter = "week" | "month" | "year";
type EmotionEntry = { date: string; kind: EmotionKind };

const allKinds: EmotionKind[] = ["joy", "sadness", "anger", "fear", "surprise", "disgust"];

export function ProfilePage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodFilter>("month");
  const [entries, setEntries] = React.useState<EmotionEntry[]>([]);

  const [pwForm, setPwForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = React.useState("");
  const [pwSuccess, setPwSuccess] = React.useState("");

  const handlePasswordChange = async () => {
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPwError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setPwSuccess("Mot de passe modifié avec succès.");
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const canChangePw = !!pwForm.currentPassword && !!pwForm.newPassword && pwForm.newPassword === pwForm.confirmPassword;

  React.useEffect(() => {
    fetch("/api/emotions")
      .then((res) => res.json())
      .then((data) => setEntries(
        (data.emotions ?? []).map((e: { date: string; kind: EmotionKind }) => ({
          date: dayjs(e.date).format("YYYY-MM-DD"),
          kind: e.kind,
        }))
      ));
  }, []);

  const today = dayjs();
  const periodStart =
    selectedPeriod === "week" ? today.startOf("isoWeek") :
    selectedPeriod === "year" ? today.startOf("year") :
    today.startOf("month");
  const periodEnd =
    selectedPeriod === "week" ? today.endOf("isoWeek") :
    selectedPeriod === "year" ? today.endOf("year") :
    today.endOf("month");

  const periodEntries = entries.filter((e) => {
    const d = dayjs(e.date);
    return !d.isBefore(periodStart, "day") && !d.isAfter(periodEnd, "day");
  });

  const grouped = allKinds
    .map((kind) => ({ kind, count: periodEntries.filter((e) => e.kind === kind).length }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);

  const dominant = grouped[0];
  const max = dominant?.count ?? 1;
  const periodLabel = selectedPeriod === "week" ? "semaine" : selectedPeriod === "month" ? "mois" : "annee";

  return (
    <>
      <PublicHeader />
      <Stack sx={{ width: "min(100%, 420px)", mx: "auto", mt: { xs: 16, lg: 10 }, gap: 2, px: { xs: 2, sm: 0 }, pb: { xs: 14, lg: 6 } }}>

        <Paper elevation={0} sx={{ px: { xs: 2, sm: 3 }, py: 3, borderRadius: "28px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
          <Stack spacing={1.5}>
            <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800 }}>Mon profil</Typography>
            <Typography variant="h5" sx={{ color: "#1f2933", fontWeight: 800 }}>{session?.user?.name}</Typography>
            <Typography variant="body2" sx={{ color: "#52616d" }}>{session?.user?.email}</Typography>

            {isAdmin && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignSelf: "flex-start" }}>
                <Button component={Link} href="/admin" variant="contained"
                  sx={{ px: 2.25, py: 1, borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}>
                  Gestion des articles
                </Button>
                <Button component={Link} href="/admin/emotions" variant="contained"
                  sx={{ px: 2.25, py: 1, borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}>
                  Gestion des émotions
                </Button>
                <Button component={Link} href="/admin/users" variant="contained"
                  sx={{ px: 2.25, py: 1, borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}>
                  Gestion des utilisateurs
                </Button>
              </Stack>
            )}

            <Button variant="outlined" onClick={() => signOut({ callbackUrl: "/login" })}
              sx={{ alignSelf: "flex-start", px: 2.25, py: 1, borderRadius: "999px", textTransform: "none", fontWeight: 700, borderColor: "rgba(36,95,66,0.4)", color: "#245f42", "&:hover": { borderColor: "#245f42" } }}>
              Se déconnecter
            </Button>
          </Stack>
        </Paper>

        {/* Changement de mot de passe */}
        <Paper elevation={0} sx={{ px: { xs: 2, sm: 3 }, py: 3, borderRadius: "28px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800 }}>Changer mon mot de passe</Typography>

            <TextField
              label="Mot de passe actuel"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              fullWidth
            />
            <TextField
              label="Nouveau mot de passe"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              fullWidth
            />
            <TextField
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              error={!!pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword}
              helperText={!!pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword ? "Les mots de passe ne correspondent pas." : " "}
              fullWidth
            />

            {pwError && <Alert severity="error">{pwError}</Alert>}
            {pwSuccess && <Alert severity="success">{pwSuccess}</Alert>}

            <Button
              variant="contained"
              disabled={!canChangePw}
              onClick={handlePasswordChange}
              sx={{ alignSelf: "flex-start", px: 2.25, py: 1, borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}
            >
              Modifier le mot de passe
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: "24px", border: "1px solid rgba(25, 194, 107, 0.12)", bgcolor: "rgba(255,255,255,0.7)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
          <Stack spacing={1.5}>
            <Typography variant="overline" sx={{ color: "#6d7a86" }}>Periode d&apos;analyse</Typography>
            <ToggleButtonGroup
              exclusive value={selectedPeriod}
              onChange={(_, v: PeriodFilter | null) => { if (v) setSelectedPeriod(v); }}
              sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.82)", borderRadius: "999px", p: 0.4 }}
            >
              <ToggleButton value="week" sx={{ border: 0, borderRadius: "999px" }}>Semaine</ToggleButton>
              <ToggleButton value="month" sx={{ border: 0, borderRadius: "999px" }}>Mois</ToggleButton>
              <ToggleButton value="year" sx={{ border: 0, borderRadius: "999px" }}>Annee</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: "24px", border: "1px solid rgba(25, 194, 107, 0.12)", bgcolor: "rgba(255,255,255,0.7)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
          {dominant ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 56, height: 56, display: "grid", placeItems: "center", borderRadius: "18px", bgcolor: `${EMOTION_COLORS[dominant.kind]}33` }}>
                  <FluentEmoji emoji={EMOTION_EMOJIS[dominant.kind]} size={36} />
                </Box>
                <Box>
                  <Typography variant="overline" sx={{ color: "#6d7a86" }}>Emotion dominante</Typography>
                  <Typography variant="h6" sx={{ color: "#1f2933", fontWeight: 800 }}>{EMOTION_LABELS[dominant.kind]}</Typography>
                  <Typography variant="body2" sx={{ color: "#52616d" }}>{EMOTION_LABELS[dominant.kind]} ressort le plus sur ce {periodLabel}.</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip label={`${periodEntries.length} entrees`} sx={{ fontWeight: 700 }} />
                <Chip label={`Periode : ${periodLabel}`} sx={{ fontWeight: 700 }} />
              </Stack>

              <Stack spacing={1.25}>
                {grouped.map((e) => (
                  <Box key={e.kind}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <FluentEmoji emoji={EMOTION_EMOJIS[e.kind]} size={20} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{EMOTION_LABELS[e.kind]}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: "#52616d" }}>{e.count}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={(e.count / max) * 100}
                      sx={{ height: 10, borderRadius: "999px", bgcolor: `${EMOTION_COLORS[e.kind]}22`, "& .MuiLinearProgress-bar": { borderRadius: "999px", backgroundColor: EMOTION_COLORS[e.kind] } }}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "#52616d" }}>Aucune emotion disponible pour cette periode.</Typography>
          )}
        </Paper>

      </Stack>
    </>
  );
}
