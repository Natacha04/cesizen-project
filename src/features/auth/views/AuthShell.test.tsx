import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthShell } from "./AuthShell";

describe("AuthShell", () => {
  // ✅ cas normal : le composant affiche bien les props reçues
  it("affiche le titre passé en prop", () => {
    render(
      <AuthShell title="Connexion" description="Connectez-vous à votre compte">
        <div />
      </AuthShell>
    );
    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });

  it("affiche la description passée en prop", () => {
    render(
      <AuthShell title="Titre" description="Bienvenue sur Cesizen">
        <div />
      </AuthShell>
    );
    expect(screen.getByText("Bienvenue sur Cesizen")).toBeInTheDocument();
  });

  // ✅ cas normal : le contenu enfant s'affiche bien à l'intérieur du shell
  it("affiche le contenu enfant (children)", () => {
    render(
      <AuthShell title="T" description="D">
        <p>Formulaire ici</p>
      </AuthShell>
    );
    expect(screen.getByText("Formulaire ici")).toBeInTheDocument();
  });

  // ❌ cas d'échec : un texte non fourni ne doit pas apparaître dans le rendu
  it("n'affiche pas un titre qui n'a pas été fourni", () => {
    render(
      <AuthShell title="Connexion" description="Description">
        <div />
      </AuthShell>
    );
    expect(screen.queryByText("Inscription")).not.toBeInTheDocument();
  });
});
