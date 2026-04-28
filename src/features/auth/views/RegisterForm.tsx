"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";

const steps = [
  { key: "lastName", title: "Votre nom", placeholder: "Nom", type: "text", autoComplete: "family-name" },
  { key: "firstName", title: "Votre prénom", placeholder: "Prénom", type: "text", autoComplete: "given-name" },
  { key: "email", title: "Votre adresse mail", placeholder: "Adresse mail", type: "email", autoComplete: "email" },
  { key: "password", title: "Votre mot de passe", placeholder: "Mot de passe", type: "password", autoComplete: "new-password" },
];

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ lastName: "", firstName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const current = steps[step];
  const value = form[current.key as keyof typeof form];
  const isLast = step === steps.length - 1;
  const canNext = isLast ? !!form.password && form.password === form.confirmPassword : !!value;

  const handleNext = async () => {
    if (!isLast) return setStep(step + 1);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h6" textAlign="center">{current.title}</Typography>

      <TextField
        type={current.type}
        placeholder={current.placeholder}
        autoComplete={current.autoComplete}
        value={value}
        onChange={(e) => setForm({ ...form, [current.key]: e.target.value })}
        fullWidth
      />

      {isLast && (
        <TextField
          type="password"
          placeholder="Confirmation mot de passe"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          error={!!form.confirmPassword && form.password !== form.confirmPassword}
          helperText={!!form.confirmPassword && form.password !== form.confirmPassword ? "Les mots de passe doivent correspondre." : " "}
          fullWidth
        />
      )}

      {error && <Alert severity="error">{error}</Alert>}

      <Button variant="contained" size="large" disabled={!canNext} onClick={handleNext}
        sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700, backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }}>
        {isLast ? "Créer mon compte" : "Suivant"}
      </Button>

      {step > 0 && (
        <Button variant="text" onClick={() => setStep(step - 1)} sx={{ textTransform: "none", color: "#52616d" }}>
          Retour
        </Button>
      )}

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Déjà un compte ?{" "}
        <Link href="/login" style={{ color: "#19c26b", fontWeight: 700 }}>Se connecter</Link>
      </Typography>
    </Box>
  );
}
