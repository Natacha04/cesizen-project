import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

export function ArticlesPage() {
  return (
    <>
      <PublicHeader />

      <Box
        component="main"
        sx={{
          width: "min(100%, 920px)",
          mx: "auto",
          px: { xs: 2, lg: 4 },
          pt: { xs: 16, lg: 12 },
          pb: { xs: 14, lg: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "28px",
            border: "1px solid rgba(25, 194, 107, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.86)",
            boxShadow: "0 18px 40px rgba(33, 54, 42, 0.12)",
          }}
        >
          <Stack spacing={1.5}>
            <Typography
              variant="overline"
              sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}
            >
              Articles
            </Typography>
            <Typography variant="h3" sx={{ color: "#101418", fontWeight: 800 }}>
              Ressources et contenus a venir
            </Typography>
            <Typography variant="body1" sx={{ color: "#52616d", maxWidth: 620 }}>
              Cette page est prete pour accueillir tes articles, ressources et
              contenus de sensibilisation. Le header pointe maintenant vers une
              vraie route, donc tu peux remplir cette section quand tu veux.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
