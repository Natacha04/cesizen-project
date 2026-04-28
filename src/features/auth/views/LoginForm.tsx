"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h6" textAlign="center">Connectez-vous !</Typography>

      <TextField
        type="email"
        placeholder="Votre adresse mail"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />

      <TextField
        type="password"
        placeholder="Votre mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button type="submit" variant="contained" size="large" disabled={!email || !password}
        sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}>
        Suivant
      </Button>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Pas de compte ?{" "}
        <Link href="/register" style={{ color: "#19c26b", fontWeight: 700 }}>Créer votre compte !</Link>
      </Typography>
    </Box>
  );
}
