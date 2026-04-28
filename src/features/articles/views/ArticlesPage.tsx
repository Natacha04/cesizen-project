"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

type Resource = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  readingTime: number;
  createdAt: string;
};

export function ArticlesPage() {
  const [resources, setResources] = React.useState<Resource[]>([]);

  React.useEffect(() => {
    fetch("/api/ressources")
      .then((res) => res.json())
      .then((data) => setResources(data.resources ?? []));
  }, []);

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
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}
            >
              Articles
            </Typography>
            <Typography variant="h4" sx={{ color: "#101418", fontWeight: 800 }}>
              Ressources et contenus
            </Typography>
          </Box>

          {resources.length === 0 ? (
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
              <Typography variant="body1" sx={{ color: "#52616d" }}>
                Aucun article pour l&apos;instant.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {resources.map((resource) => (
                <Paper
                  key={resource.id}
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: "24px",
                    border: "1px solid rgba(25, 194, 107, 0.12)",
                    backgroundColor: "rgba(255, 255, 255, 0.86)",
                    boxShadow: "0 18px 40px rgba(33, 54, 42, 0.08)",
                  }}
                >
                  <Stack spacing={1.5}>
                    {resource.imageUrl && (
                      <Box
                        component="img"
                        src={resource.imageUrl}
                        alt={resource.title}
                        sx={{ width: "100%", borderRadius: "16px", maxHeight: 260, objectFit: "cover" }}
                      />
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={`${resource.readingTime} min`} size="small" sx={{ fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="h6" sx={{ color: "#1f2933", fontWeight: 800 }}>
                      {resource.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#52616d", whiteSpace: "pre-wrap" }}>
                      {resource.content}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    </>
  );
}
