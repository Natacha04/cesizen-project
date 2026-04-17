"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

export function RegisterForm() {
  const router = useRouter();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isValid =
    !!firstname &&
    !!lastname &&
    !!email &&
    !!password &&
    password === confirmPassword;

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstname, lastname, email, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
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

      {error && <Alert severity="error">{error}</Alert>}

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
