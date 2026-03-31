"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import cesizenLogo from "@/app/public/CESIZEN.png";

const desktopHeaderItems = [
  { label: "Accueil", href: "/" },
  { label: "Tracker d'emotions", href: "/emotions/tracker" },
  { label: "Articles", href: "/articles" },
  { label: "A propos", href: "/a-propos" },
  { label: "Connexion", href: "/login" },
];

function isCurrentPath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeaderDesktop() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: { xs: "none", lg: "block" },
        position: "sticky",
        top: 24,
        zIndex: 10,
        px: 4,
        pt: 3,
      }}
    >
      <Box
        sx={{
          mx: "auto",
          maxWidth: 1220,
          display: "grid",
          gridTemplateColumns: "180px 1fr 180px",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            width: "fit-content",
            textDecoration: "none",
          }}
        >
          <Image src={cesizenLogo} alt="Cesizen" width={88} height={88} priority />
        </Box>

        <Paper
          elevation={0}
          sx={{
            justifySelf: "center",
            px: 4,
            py: 2.3,
            borderRadius: "18px",
            border: "1px solid rgba(31, 90, 63, 0.08)",
            bgcolor: "rgba(255, 255, 255, 0.84)",
            boxShadow: "0 12px 28px rgba(32, 56, 44, 0.12)",
          }}
        >
          <Stack direction="row" spacing={3.75} alignItems="center">
            {desktopHeaderItems.map((item) => {
              const isActive = isCurrentPath(pathname, item.href);

              return (
                <Box
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#101418",
                    fontWeight: 700,
                    textDecoration: "none",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -6,
                      height: 3,
                      borderRadius: "999px",
                      backgroundColor: isActive ? "#19c26b" : "transparent",
                      transition: "background-color 160ms ease",
                    },
                    "&:hover::after": {
                      backgroundColor: isActive ? "#19c26b" : "#f0b429",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        <Box />
      </Box>
    </Box>
  );
}
