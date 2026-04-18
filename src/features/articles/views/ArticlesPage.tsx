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

export function ArticlesPage() {
  const [ressources, setRessources] = useState<Ressource[]>([]);

  useEffect(() => {
    fetch("/api/ressource")
      .then((res) => res.json())
      .then((data) => setRessources(data.ressources ?? []));
  }, []);

  return (
    <>
      <PublicHeader />
      <main style={{ padding: "6rem 2rem 2rem", maxWidth: 920, margin: "0 auto" }}>
        <h1>Articles</h1>

        {ressources.length === 0 ? (
          <p>Aucun article disponible.</p>
        ) : (
          <div style={{ display: "grid", gap: "2rem" }}>
            {ressources.map((r) => (
              <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: "1.5rem" }}>
                {r.imageUrl && (
                  <img src={r.imageUrl} alt={r.title} style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 8, marginBottom: "1rem" }} />
                )}
                <p style={{ color: "#52616d", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>
                  {r.readingTime} min de lecture · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <h2 style={{ margin: "0 0 1rem" }}>{r.title}</h2>
                <p>{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
