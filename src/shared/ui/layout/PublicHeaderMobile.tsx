"use client";

import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { publicHeaderItems } from "@/shared/ui/layout/publicHeaderItems";

export function PublicHeaderMobile() {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = publicHeaderItems.findIndex(
    (item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <Box
      sx={{
        display: { xs: "block", lg: "none" },
        position: "fixed",
        bottom: 16,
        left: 0,
        right: 0,
        px: 2,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 420,
          mx: "auto",
          borderRadius: "999px",
          overflow: "hidden",
          bgcolor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
        }}
      >
        <BottomNavigation
          showLabels={false}
          value={currentIndex}
          sx={{ bgcolor: "#ffffff", height: 72 }}
        >
          {publicHeaderItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={<Icon />}
                value={index}
                onClick={() => router.push(item.href)}
                sx={{
                  color: "#2f6b4f",
                  minWidth: 0,
                  "&.Mui-selected": { color: "#1f5a3f" },
                }}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
