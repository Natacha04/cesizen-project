"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
};

const emptyForm = { firstName: "", lastName: "", email: "", password: "", role: "USER" };

export function UserAdminPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [form, setForm] = React.useState(emptyForm);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const fetchUsers = React.useCallback(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []));
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setForm(emptyForm);
    setSuccess("Compte créé avec succès.");
    fetchUsers();
  };

  const handleToggleActive = async (user: User) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    fetchUsers();
  };

  const handleToggleRole = async (user: User) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: user.role === "ADMIN" ? "USER" : "ADMIN" }),
    });
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const canSubmit = !!form.firstName && !!form.lastName && !!form.email && !!form.password;

  const btnStyle = {
    borderRadius: "999px",
    textTransform: "none" as const,
    fontWeight: 700,
    backgroundColor: "#245f42",
    "&:hover": { backgroundColor: "#1e5138" },
  };

  return (
    <>
      <PublicHeader />
      <Box sx={{ width: "min(100%, 680px)", mx: "auto", mt: { xs: 16, lg: 10 }, px: { xs: 2, sm: 0 }, pb: { xs: 14, lg: 6 } }}>
        <Stack spacing={2}>

          {/* Navigation admin */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="text" onClick={() => router.push("/admin")} sx={{ textTransform: "none", color: "#52616d" }}>
              Articles
            </Button>
            <Button variant="text" onClick={() => router.push("/admin/emotions")} sx={{ textTransform: "none", color: "#52616d" }}>
              Émotions
            </Button>
            <Button variant="contained" sx={btnStyle}>
              Utilisateurs
            </Button>
          </Stack>

          {/* Formulaire de création */}
          <Paper elevation={0} sx={{ px: { xs: 2, sm: 3 }, py: 3, borderRadius: "28px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", backdropFilter: "blur(16px)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)" }}>
            <Stack spacing={2}>
              <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}>
                Créer un compte
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="Nom"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Prénom"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Adresse email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                fullWidth
              />

              <TextField
                label="Mot de passe"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                fullWidth
              />

              {/* Sélecteur de rôle */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant={form.role === "USER" ? "contained" : "outlined"}
                  onClick={() => setForm({ ...form, role: "USER" })}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 700,
                    ...(form.role === "USER"
                      ? { backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }
                      : { borderColor: "#245f42", color: "#245f42" }),
                  }}
                >
                  Utilisateur
                </Button>
                <Button
                  variant={form.role === "ADMIN" ? "contained" : "outlined"}
                  onClick={() => setForm({ ...form, role: "ADMIN" })}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 700,
                    ...(form.role === "ADMIN"
                      ? { backgroundColor: "#245f42", "&:hover": { backgroundColor: "#1e5138" } }
                      : { borderColor: "#245f42", color: "#245f42" }),
                  }}
                >
                  Administrateur
                </Button>
              </Stack>

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              <Button variant="contained" disabled={!canSubmit} onClick={handleCreate} sx={{ ...btnStyle, alignSelf: "flex-start" }}>
                Créer le compte
              </Button>
            </Stack>
          </Paper>

          {/* Liste des utilisateurs */}
          <Paper elevation={0} sx={{ borderRadius: "24px", border: "1px solid rgba(25, 194, 107, 0.12)", backgroundColor: "rgba(255,255,255,0.84)", backdropFilter: "blur(16px)", boxShadow: "0 20px 60px rgba(42,66,54,0.08)", overflow: "hidden" }}>
            <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em", px: 3, pt: 3, display: "block" }}>
              Comptes ({users.length})
            </Typography>

            {users.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#52616d", p: 3 }}>Aucun utilisateur.</Typography>
            ) : (
              <Stack divider={<Divider />} sx={{ mt: 1 }}>
                {users.map((user) => (
                  <Stack key={user.id} sx={{ px: 3, py: 2 }} spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1" sx={{ fontWeight: 700, color: user.isActive ? "#1f2933" : "#aaa" }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              backgroundColor: user.role === "ADMIN" ? "#245f4218" : "#f0f0f0",
                              color: user.role === "ADMIN" ? "#245f42" : "#52616d",
                            }}
                          />
                          {!user.isActive && (
                            <Chip label="Désactivé" size="small" sx={{ fontWeight: 700, backgroundColor: "#ffeaea", color: "#c0392b" }} />
                          )}
                        </Stack>
                        <Typography variant="caption" sx={{ color: "#6d7a86" }}>{user.email}</Typography>
                      </Box>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleToggleRole(user)}
                          sx={{ textTransform: "none", borderRadius: "999px", borderColor: "#245f42", color: "#245f42" }}
                        >
                          {user.role === "ADMIN" ? "Retirer admin" : "Mettre admin"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleToggleActive(user)}
                          sx={{
                            textTransform: "none",
                            borderRadius: "999px",
                            borderColor: user.isActive ? "#e67e22" : "#245f42",
                            color: user.isActive ? "#e67e22" : "#245f42",
                          }}
                        >
                          {user.isActive ? "Désactiver" : "Réactiver"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDelete(user.id)}
                          sx={{ textTransform: "none", borderRadius: "999px", borderColor: "#c0392b", color: "#c0392b" }}
                        >
                          Supprimer
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>

        </Stack>
      </Box>
    </>
  );
}
