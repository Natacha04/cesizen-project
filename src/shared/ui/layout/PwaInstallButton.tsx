"use client";

import * as React from "react";
import Button from "@mui/material/Button";

export function PwaInstallButton() {
  const [prompt, setPrompt] = React.useState<Event & { prompt: () => void } | null>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as Event & { prompt: () => void });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt) return null;

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={() => { prompt.prompt(); setPrompt(null); }}
      sx={{
        borderRadius: "999px",
        textTransform: "none",
        fontWeight: 700,
        borderColor: "#19c26b",
        color: "#19c26b",
        "&:hover": { borderColor: "#17ad5f", backgroundColor: "rgba(25,194,107,0.06)" },
      }}
    >
      Installer l&apos;app
    </Button>
  );
}
