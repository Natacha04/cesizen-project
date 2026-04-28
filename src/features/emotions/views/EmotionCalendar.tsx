"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { FluentEmoji } from "@lobehub/fluent-emoji";
import { useRouter } from "next/navigation";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { EmotionKind, EMOTION_COLORS, EMOTION_EMOJIS, EMOTION_LABELS } from "@/shared/constants/emotions";

dayjs.extend(isoWeek);

type PeriodFilter = "week" | "month" | "year";

type EmotionEntry = {
  date: string;
  kind: EmotionKind;
};

const allKinds: EmotionKind[] = ["joy", "sadness", "anger", "fear", "surprise", "disgust"];

function EmotionDay(props: PickersDayProps & { emotionEntries?: EmotionEntry[] }) {
  const { emotionEntries = [], day, outsideCurrentMonth, ...other } = props;
  const entry = !outsideCurrentMonth
    ? emotionEntries.find((e) => dayjs(e.date).isSame(day, "day"))
    : undefined;

  return (
    <Box key={day.toString()} sx={{ position: "relative" }}>
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={entry ? {
          backgroundColor: `${EMOTION_COLORS[entry.kind]}22`,
          border: `1px solid ${EMOTION_COLORS[entry.kind]}`,
          fontWeight: 700,
        } : {}}
      />
      {entry && (
        <Box sx={{
          position: "absolute",
          top: -4,
          right: -4,
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: EMOTION_COLORS[entry.kind],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <FluentEmoji emoji={EMOTION_EMOJIS[entry.kind]} size={12} />
        </Box>
      )}
    </Box>
  );
}

export function EmotionCalendar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodFilter>("month");
  const [entries, setEntries] = React.useState<EmotionEntry[]>([]);

  React.useEffect(() => {
    fetch("/api/emotions")
      .then((res) => res.json())
      .then((data) => {
        setEntries(
          (data.emotions ?? []).map((e: { date: string; kind: EmotionKind }) => ({
            date: dayjs(e.date).format("YYYY-MM-DD"),
            kind: e.kind,
          }))
        );
        setIsLoading(false);
      });
  }, []);

  const monthEntries = entries.filter((e) => dayjs(e.date).isSame(selectedDate, "month"));

  const periodStart =
    selectedPeriod === "week" ? selectedDate.startOf("isoWeek") :
    selectedPeriod === "year" ? selectedDate.startOf("year") :
    selectedDate.startOf("month");

  const periodEnd =
    selectedPeriod === "week" ? selectedDate.endOf("isoWeek") :
    selectedPeriod === "year" ? selectedDate.endOf("year") :
    selectedDate.endOf("month");

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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "min(100%, 900px)",
          mx: "auto",
          mt: { xs: 16, lg: 10 },
          px: { xs: 2, sm: 3, lg: 0 },
          pb: { xs: 14, lg: 6 },
          display: { xs: "flex", lg: "grid" },
          flexDirection: "column",
          gridTemplateColumns: { lg: "420px 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper elevation={0} sx={{ px: { xs: 2, sm: 3 }, py: 3, borderRadius: "28px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800 }}>Suivi emotionnel</Typography>
              <Typography variant="h5" sx={{ color: "#1f2933", fontWeight: 800 }}>Ton calendrier du mois</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "#52616d" }}>Les jours remplis affichent l&apos;emotion enregistree.</Typography>
            </Box>

            <DateCalendar
              value={selectedDate}
              loading={isLoading}
              onChange={(value: Dayjs | null) => { if (value) setSelectedDate(value); }}
              onMonthChange={(date: Dayjs) => setSelectedDate(date.startOf("month"))}
              renderLoading={() => <DayCalendarSkeleton />}
              slots={{ day: EmotionDay }}
              slotProps={{ day: { emotionEntries: monthEntries } as PickersDayProps & { emotionEntries: EmotionEntry[] } }}
              sx={{ width: "100%", "& .MuiDayCalendar-weekDayLabel": { color: "#64707d", fontWeight: 700 } }}
            />

            <Button
              variant="contained"
              onClick={() => router.push(`/emotions/tracker?date=${dayjs().format("YYYY-MM-DD")}`)}
              sx={{ alignSelf: "flex-start", px: 2.25, py: 1.2, borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#19c26b", "&:hover": { backgroundColor: "#11ad5d" } }}
            >
              Mon emotion du jour
            </Button>
          </Stack>
        </Paper>

        <Stack gap={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: "24px", border: "1px solid rgba(25, 194, 107, 0.12)", bgcolor: "rgba(255,255,255,0.7)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: "#6d7a86" }}>Periode d&apos;analyse</Typography>
              <ToggleButtonGroup
                exclusive
                value={selectedPeriod}
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
                      <LinearProgress
                        variant="determinate"
                        value={(e.count / max) * 100}
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
      </Box>
    </LocalizationProvider>
  );
}
