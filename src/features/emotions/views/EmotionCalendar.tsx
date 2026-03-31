"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";

dayjs.extend(isoWeek);

type EmotionKind = "joy" | "calm" | "sad" | "energy" | "stress";
type PeriodFilter = "week" | "month" | "year";

type EmotionEntry = {
  date: string;
  emoji: string;
  label: string;
  kind: EmotionKind;
};

type EmotionDefinition = Omit<EmotionEntry, "date">;

const emotionPalette: Record<EmotionKind, string> = {
  joy: "#ffd95f",
  calm: "#8fe3c5",
  sad: "#9bb7ff",
  energy: "#19c26b",
  stress: "#f09b73",
};

const emotionCatalog: EmotionDefinition[] = [
  { emoji: "😊", label: "Joie", kind: "joy" },
  { emoji: "😌", label: "Calme", kind: "calm" },
  { emoji: "😔", label: "Tristesse", kind: "sad" },
  { emoji: "🤩", label: "Energie", kind: "energy" },
  { emoji: "😵", label: "Stress", kind: "stress" },
];

const periodLabels: Record<PeriodFilter, string> = {
  week: "Semaine",
  month: "Mois",
  year: "Annee",
};

function getSeededNumber(seed: number, min: number, max: number) {
  const normalized = Math.abs(Math.sin(seed) * 10000) % 1;

  return Math.floor(normalized * (max - min + 1)) + min;
}

function buildYearEntries(anchorDate: Dayjs) {
  const entries: EmotionEntry[] = [];
  const year = anchorDate.year();

  for (let month = 0; month < 12; month += 1) {
    const monthDate = dayjs(new Date(year, month, 1));
    const entriesCount = getSeededNumber(year * 50 + month * 13, 5, 9);
    const usedDays = new Set<number>();

    for (let index = 0; index < entriesCount; index += 1) {
      const daysInMonth = monthDate.daysInMonth();
      let day = getSeededNumber(year * 1000 + month * 100 + index * 17, 1, daysInMonth);

      while (usedDays.has(day)) {
        day = (day % daysInMonth) + 1;
      }

      usedDays.add(day);

      const emotion =
        emotionCatalog[
          getSeededNumber(
            year * 2000 + month * 100 + index * 19,
            0,
            emotionCatalog.length - 1,
          )
        ];

      entries.push({
        ...emotion,
        date: monthDate.date(day).format("YYYY-MM-DD"),
      });
    }
  }

  return entries.sort((first, second) => first.date.localeCompare(second.date));
}

function fakeFetch(date: Dayjs, { signal }: { signal: AbortSignal }) {
  return new Promise<{ entries: EmotionEntry[] }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve({ entries: buildYearEntries(date) });
    }, 450);

    signal.onabort = () => {
      clearTimeout(timeout);
      reject(new DOMException("aborted", "AbortError"));
    };
  });
}

const initialValue = dayjs();

function EmotionDay(props: PickersDayProps & { emotionEntries?: EmotionEntry[] }) {
  const { emotionEntries = [], day, outsideCurrentMonth, ...other } = props;

  const entry = !outsideCurrentMonth
    ? emotionEntries.find((currentEntry) => dayjs(currentEntry.date).isSame(day, "day"))
    : undefined;

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={entry ? entry.emoji : undefined}
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.75rem",
          minWidth: 20,
          height: 20,
          borderRadius: "999px",
          backgroundColor: entry ? emotionPalette[entry.kind] : undefined,
          boxShadow: entry ? "0 4px 12px rgba(0, 0, 0, 0.12)" : undefined,
        },
      }}
    >
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          ...(entry && {
            backgroundColor: `${emotionPalette[entry.kind]}22`,
            border: `1px solid ${emotionPalette[entry.kind]}`,
            fontWeight: 700,
          }),
        }}
      />
    </Badge>
  );
}

export function EmotionCalendar() {
  const router = useRouter();
  const requestAbortController = React.useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState(initialValue);
  const [displayMonth, setDisplayMonth] = React.useState(initialValue.startOf("month"));
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<PeriodFilter>("month");
  const [emotionEntries, setEmotionEntries] = React.useState<EmotionEntry[]>([]);

  const fetchEmotionEntries = React.useCallback((date: Dayjs) => {
    const controller = new AbortController();

    fakeFetch(date, {
      signal: controller.signal,
    })
      .then(({ entries }) => {
        setEmotionEntries(entries);
        setIsLoading(false);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          throw error;
        }
      });

    requestAbortController.current = controller;
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    fetchEmotionEntries(initialValue);

    return () => requestAbortController.current?.abort();
  }, [fetchEmotionEntries]);

  const monthEntries = React.useMemo(
    () =>
      emotionEntries.filter((entry) =>
        dayjs(entry.date).isSame(displayMonth, "month"),
      ),
    [displayMonth, emotionEntries],
  );

  const periodRange = React.useMemo(() => {
    switch (selectedPeriod) {
      case "week":
        return {
          start: selectedDate.startOf("isoWeek"),
          end: selectedDate.endOf("isoWeek"),
        };
      case "year":
        return {
          start: selectedDate.startOf("year"),
          end: selectedDate.endOf("year"),
        };
      case "month":
      default:
        return {
          start: selectedDate.startOf("month"),
          end: selectedDate.endOf("month"),
        };
    }
  }, [selectedDate, selectedPeriod]);

  const entriesForSelectedPeriod = React.useMemo(
    () =>
      emotionEntries.filter((entry) => {
        const entryDate = dayjs(entry.date);

        return (
          !entryDate.isBefore(periodRange.start, "day") &&
          !entryDate.isAfter(periodRange.end, "day")
        );
      }),
    [emotionEntries, periodRange.end, periodRange.start],
  );

  const groupedEntries = React.useMemo(
    () =>
      emotionCatalog
        .map((emotion) => ({
          ...emotion,
          count: entriesForSelectedPeriod.filter(
            (entry) => entry.kind === emotion.kind,
          ).length,
        }))
        .filter((emotion) => emotion.count > 0)
        .sort((first, second) => second.count - first.count),
    [entriesForSelectedPeriod],
  );

  const dominantEmotion = groupedEntries[0];
  const highestCount = dominantEmotion?.count ?? 1;

  const handleMonthChange = (date: Dayjs) => {
    requestAbortController.current?.abort();
    const normalizedDate = date.startOf("month");

    setIsLoading(true);
    setSelectedDate(normalizedDate);
    setDisplayMonth(normalizedDate);
    fetchEmotionEntries(normalizedDate);
  };

  const handleDateChange = (value: Dayjs | null) => {
    if (!value) {
      return;
    }

    setSelectedDate(value);
    setDisplayMonth(value.startOf("month"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack
        sx={{
          width: "min(100%, 420px)",
          mx: "auto",
          mt: { xs: 16, lg: 10 },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2, sm: 3 },
            py: 3,
            borderRadius: "28px",
            border: "1px solid rgba(25, 194, 107, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.84)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 60px rgba(42, 66, 54, 0.08)",
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}
              >
                Suivi emotionnel
              </Typography>
              <Typography variant="h5" sx={{ color: "#1f2933", fontWeight: 800 }}>
                Ton calendrier du mois
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "#52616d" }}>
                Les jours remplis affichent l&apos;emotion enregistree.
              </Typography>
            </Box>

            <DateCalendar
              value={selectedDate}
              loading={isLoading}
              onChange={handleDateChange}
              onMonthChange={handleMonthChange}
              renderLoading={() => <DayCalendarSkeleton />}
              slots={{
                day: EmotionDay,
              }}
              slotProps={{
                day: {
                  emotionEntries: monthEntries,
                } as PickersDayProps & { emotionEntries: EmotionEntry[] },
              }}
              sx={{
                width: "100%",
                "& .MuiPickersCalendarHeader-root": {
                  px: 1,
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "#64707d",
                  fontWeight: 700,
                },
              }}
            />

            <Button
              variant="contained"
              onClick={() =>
                router.push(
                  `/emotions/tracker?date=${dayjs().format("YYYY-MM-DD")}`,
                )
              }
              sx={{
                alignSelf: "flex-start",
                px: 2.25,
                py: 1.2,
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#19c26b",
                boxShadow: "0 14px 30px rgba(25, 194, 107, 0.22)",
                "&:hover": {
                  backgroundColor: "#11ad5d",
                },
              }}
            >
              Mon emotion du jour
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "24px",
            border: "1px solid rgba(25, 194, 107, 0.12)",
            bgcolor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 60px rgba(42, 66, 54, 0.08)",
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="overline" sx={{ color: "#6d7a86" }}>
              Periode d&apos;analyse
            </Typography>

            <ToggleButtonGroup
              exclusive
              value={selectedPeriod}
              onChange={(_, value: PeriodFilter | null) => {
                if (value) {
                  setSelectedPeriod(value);
                }
              }}
              sx={{
                alignSelf: "flex-start",
                bgcolor: "rgba(255, 255, 255, 0.82)",
                borderRadius: "999px",
                p: 0.4,
                boxShadow: "0 10px 24px rgba(22, 36, 28, 0.06)",
              }}
            >
              <ToggleButton value="week" sx={{ border: 0, borderRadius: "999px" }}>
                Semaine
              </ToggleButton>
              <ToggleButton value="month" sx={{ border: 0, borderRadius: "999px" }}>
                Mois
              </ToggleButton>
              <ToggleButton value="year" sx={{ border: 0, borderRadius: "999px" }}>
                Annee
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "24px",
            border: "1px solid rgba(25, 194, 107, 0.12)",
            bgcolor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 60px rgba(42, 66, 54, 0.08)",
          }}
        >
          {dominantEmotion ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "18px",
                    fontSize: "1.75rem",
                    bgcolor: `${emotionPalette[dominantEmotion.kind]}33`,
                  }}
                >
                  {dominantEmotion.emoji}
                </Box>

                <Box>
                  <Typography variant="overline" sx={{ color: "#6d7a86" }}>
                    Emotion dominante
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1f2933", fontWeight: 800 }}
                  >
                    {dominantEmotion.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#52616d" }}>
                    {dominantEmotion.label} ressort le plus sur cette{" "}
                    {periodLabels[selectedPeriod].toLowerCase()}.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={`${entriesForSelectedPeriod.length} jours renseignes`}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`Periode : ${periodLabels[selectedPeriod]}`}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`Repere : ${selectedDate.format("DD/MM/YYYY")}`}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Stack spacing={1.25}>
                {groupedEntries.map((entry) => (
                  <Box key={entry.kind}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.75 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#1f2933", fontWeight: 600 }}
                      >
                        {entry.emoji} {entry.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#52616d" }}>
                        {entry.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(entry.count / highestCount) * 100}
                      sx={{
                        height: 10,
                        borderRadius: "999px",
                        bgcolor: `${emotionPalette[entry.kind]}22`,
                        "& .MuiLinearProgress-bar": {
                          borderRadius: "999px",
                          backgroundColor: emotionPalette[entry.kind],
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          ) : (
              <Typography variant="body2" sx={{ color: "#52616d" }}>
                Aucune emotion n&apos;est disponible pour cette periode.
              </Typography>
            )}
        </Paper>
      </Stack>
    </LocalizationProvider>
  );
}
