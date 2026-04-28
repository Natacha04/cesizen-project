import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

export function AboutPage() {
  return (
    <>
      <PublicHeader />

      <Box
        component="main"
        sx={{
          width: "min(100%, 720px)",
          mx: "auto",
          px: { xs: 2, lg: 4 },
          pt: { xs: 16, lg: 12 },
          pb: { xs: 14, lg: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: "28px",
            border: "1px solid rgba(25, 194, 107, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.86)",
            boxShadow: "0 18px 40px rgba(33, 54, 42, 0.12)",
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              <Box component="span" sx={{ color: "#19c26b" }}>CESI</Box>
              <Box component="span" sx={{ color: "#f0b429" }}>ZEN</Box>
            </Typography>

            <Stack spacing={2}>
              <Typography variant="body1" sx={{ color: "#1f2933", fontWeight: 600, lineHeight: 1.7 }}>
                Notre objectif est d&apos;informer le grand public sur l&apos;importance de la santé mentale en proposant des fonctionnalités pour aider le quotidien de chacun.
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2933", fontWeight: 600, lineHeight: 1.7 }}>
                Ce support a été créé et porté par le Ministère de la santé et de la prévention.
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2933", fontWeight: 600, lineHeight: 1.7 }}>
                Ce projet vient proposer un tracker d&apos;émotions afin de permettre un suivi autonome et journalier des émotions.
              </Typography>
              <Typography variant="body1" sx={{ color: "#1f2933", fontWeight: 600, lineHeight: 1.7 }}>
                Ce tracker étant un premier indicateur de l&apos;état de santé mentale d&apos;une personne.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
