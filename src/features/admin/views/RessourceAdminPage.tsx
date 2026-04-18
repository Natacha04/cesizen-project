"use client";

import { useEffect, useState } from "react";
import { PublicHeader } from "@/shared/ui/layout/PublicHeader";

type Ressource = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  readingTime: number;
  createdAt: string;
};

const emptyForm = { title: "", content: "", imageUrl: "", readingTime: 0 };

export function RessourceAdminPage() {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editTarget, setEditTarget] = useState<Ressource | null>(null);

  const fetchRessources = async () => {
    const res = await fetch("/api/ressource");
    const data = await res.json();
    setRessources(data.ressources ?? []);
  };

  useEffect(() => { fetchRessources(); }, []);

  const handleSave = async () => {
    const body = {
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || null,
      readingTime: Number(form.readingTime),
    };

    if (editTarget) {
      await fetch(`/api/ressource/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/ressource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setForm(emptyForm);
    setEditTarget(null);
    fetchRessources();
  };

  const handleEdit = (r: Ressource) => {
    setEditTarget(r);
    setForm({
      title: r.title,
      content: r.content,
      imageUrl: r.imageUrl ?? "",
      readingTime: r.readingTime,
    });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/ressource/${id}`, { method: "DELETE" });
    fetchRessources();
  };

  return (
    <>
      <PublicHeader />
      <main style={{ padding: "6rem 2rem 2rem" }}>
        <h1>Gestion des ressources</h1>

        <div style={{ marginBottom: "2rem" }}>
          <h2>{editTarget ? "Modifier" : "Créer"} une ressource</h2>
          <div style={{ display: "grid", gap: "0.75rem", maxWidth: 480 }}>
            <input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Contenu"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
            />
            <input
              placeholder="URL de l'image (optionnel)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <input
              placeholder="Durée de lecture (minutes)"
              type="number"
              value={form.readingTime}
              onChange={(e) => setForm({ ...form, readingTime: Number(e.target.value) })}
            />
            <button onClick={handleSave} disabled={!form.title || !form.content || !form.readingTime}>
              {editTarget ? "Sauvegarder" : "Créer"}
            </button>
            {editTarget && (
              <button onClick={() => { setEditTarget(null); setForm(emptyForm); }}>
                Annuler
              </button>
            )}
          </div>
        </div>

        <h2>Liste des ressources</h2>
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Durée (min)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ressources.length === 0 ? (
              <tr><td colSpan={4}>Aucune ressource.</td></tr>
            ) : (
              ressources.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.readingTime} min</td>
                  <td>{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <button onClick={() => handleEdit(r)}>Modifier</button>{" "}
                    <button onClick={() => handleDelete(r.id)}>Supprimer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </>
  );
}
