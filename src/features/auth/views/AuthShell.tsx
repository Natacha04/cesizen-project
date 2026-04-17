import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <>
      <PublicHeader />
      <Box component="main" sx={{ px: "1.5rem", pt: "4rem", pb: "5rem" }}>
        <Box
          component="section"
          sx={{
            maxWidth: 520,
            mx: "auto",
            display: "grid",
            gap: "1.5rem",
          }}
        >
          <Box sx={{ display: "grid", gap: "0.75rem", textAlign: "center" }}>
            <Typography
              component="h1"
              sx={{
                m: 0,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.05,
                fontWeight: 800,
                color: "#1d2a35",
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ m: 0, color: "#44515d", lineHeight: 1.6 }}>
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              p: "1.5rem",
              borderRadius: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.76)",
              boxShadow: "0 24px 60px rgba(60, 47, 22, 0.12)",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
