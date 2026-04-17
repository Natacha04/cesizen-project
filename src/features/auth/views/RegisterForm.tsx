"use client";

import Link from "next/link";
import { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

export function RegisterForm() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValid =
    !!firstname &&
    !!lastname &&
    !!email &&
    !!password &&
    password === confirmPassword;

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{ display: "grid", gap: 2 }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h6" component="h2">
          Création de compte
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Créez votre compte pour commencer à suivre vos émotions.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <TextField
          label="Prénom"
          autoComplete="given-name"
          value={firstname}
          onChange={(event) => setFirstname(event.target.value)}
          fullWidth
        />
        <TextField
          label="Nom"
          autoComplete="family-name"
          value={lastname}
          onChange={(event) => setLastname(event.target.value)}
          fullWidth
        />
      </Box>

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
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
      />

      <TextField
        label="Confirmer le mot de passe"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={!!confirmPassword && password !== confirmPassword}
        helperText={
          !!confirmPassword && password !== confirmPassword
            ? "Les mots de passe doivent correspondre."
            : " "
        }
        fullWidth
      />

      <Button type="submit" variant="contained" size="large" disabled={!isValid}>
        Créer un compte
      </Button>

      <Typography variant="body2" color="text.secondary">
        Déjà un compte ?{" "}
        <Link href="/login" style={{ color: "#19c26b", fontWeight: 700 }}>
          Se connecter
        </Link>
      </Typography>
    </Box>
  );
}
