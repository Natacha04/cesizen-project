"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

type Resource = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  readingTime: number;
};

const emptyForm = { title: "", content: "", imageUrl: "", readingTime: "" };

export function ResourceAdminPage() {
  const router = useRouter();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [form, setForm] = React.useState(emptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const fetchResources = React.useCallback(() => {
    fetch("/api/ressources")
      .then((res) => res.json())
      .then((data) => setResources(data.resources ?? []));
  }, []);

  React.useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleSubmit = async () => {
    setError("");
    const url = editingId ? `/api/ressources/${editingId}` : "/api/ressources";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, readingTime: Number(form.readingTime) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    fetchResources();
  };

  const handleEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setForm({
      title: resource.title,
      content: resource.content,
      imageUrl: resource.imageUrl ?? "",
      readingTime: String(resource.readingTime),
    });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/ressources/${id}`, { method: "DELETE" });
    fetchResources();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const canSubmit = !!form.title && !!form.content && !!form.readingTime;

  return (
    <>
      <PublicHeader />
      <Box
        sx={{
          width: "min(100%, 680px)",
          mx: "auto",
          mt: { xs: 16, lg: 10 },
          px: { xs: 2, sm: 0 },
          pb: { xs: 14, lg: 6 },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#245f42",
                "&:hover": { backgroundColor: "#1e5138" },
              }}
            >
              Articles
            </Button>
            <Button
              variant="text"
              onClick={() => router.push("/admin/emotions")}
              sx={{ textTransform: "none", color: "#52616d" }}
            >
              Émotions
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              px: { xs: 2, sm: 3 },
              py: 3,
              borderRadius: "28px",
              border: "1px solid rgba(25, 194, 107, 0.12)",
              backgroundColor: "rgba(255, 255, 255, 0.84)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 60px rgba(42, 66, 54, 0.08)",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="overline" sx={{ color: "#19c26b", fontWeight: 800, letterSpacing: "0.16em" }}>
                {editingId ? "Modifier l'article" : "Nouvel article"}
              </Typography>

              <TextField
                label="Titre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Contenu"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                multiline
                minRows={4}
                fullWidth
              />
              <TextField
                label="URL de l'image (optionnel)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                fullWidth
              />
              <TextField
                label="Durée de lecture (min)"
                type="number"
                value={form.readingTime}
                onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                fullWidth
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#245f42",
                    "&:hover": { backgroundColor: "#1e5138" },
                  }}
                >
                  {editingId ? "Enregistrer" : "Créer"}
                </Button>
                {editingId && (
                  <Button
                    variant="text"
                    onClick={handleCancel}
                    sx={{ textTransform: "none", color: "#52616d" }}
                  >
                    Annuler
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: "1px solid rgba(25, 194, 107, 0.12)",
              backgroundColor: "rgba(255, 255, 255, 0.84)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 60px rgba(42, 66, 54, 0.08)",
              overflow: "hidden",
            }}
          >
            {resources.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#52616d", p: 3 }}>
                Aucun article pour l&apos;instant.
              </Typography>
            ) : (
              <Stack divider={<Divider />}>
                {resources.map((resource) => (
                  <Stack
                    key={resource.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 3, py: 2 }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#1f2933" }}>
                        {resource.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#52616d" }}>
                        {resource.readingTime} min de lecture
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(resource)}
                        sx={{ textTransform: "none", borderRadius: "999px", borderColor: "#245f42", color: "#245f42" }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDelete(resource.id)}
                        sx={{ textTransform: "none", borderRadius: "999px", borderColor: "#c0392b", color: "#c0392b" }}
                      >
                        Supprimer
                      </Button>
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
