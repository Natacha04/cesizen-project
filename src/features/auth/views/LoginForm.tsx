"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{ display: "grid", gap: 2 }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h6" component="h2">
          Accès utilisateur
        </Typography>
        <Typography variant="body2" color="text.secondary">
          La couche UI est prête. Le branchement métier viendra ensuite via la
          couche serveur.
        </Typography>
      </Stack>

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
      />

      <TextField
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
      />

      <Alert severity="info">
        Aucun appel API n&apos;est encore branché sur ce formulaire.
      </Alert>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={!email || !password}
      >
        Se connecter
      </Button>

      <Typography variant="body2" color="text.secondary">
        Pas encore de compte ?{" "}
        <Link href="/register" style={{ color: "#8a3d1b", fontWeight: 700 }}>
          Créer un compte
        </Link>
      </Typography>
    </Box>
  );
}
