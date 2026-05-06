import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helpers pour naviguer rapidement jusqu'à une étape
async function goToStep(user: ReturnType<typeof userEvent.setup>, step: number) {
  const stepData = [
    { placeholder: "Nom", value: "Dupont" },
    { placeholder: "Prénom", value: "Jean" },
    { placeholder: "Adresse mail", value: "jean@example.com" },
  ];
  for (let i = 0; i < step; i++) {
    await user.type(screen.getByPlaceholderText(stepData[i].placeholder), stepData[i].value);
    await user.click(screen.getByRole("button", { name: /suivant/i }));
  }
}

describe("RegisterForm", () => {
  // ✅ cas normal : la première étape s'affiche au départ
  it("affiche la première étape avec le champ Nom", () => {
    render(<RegisterForm />);
    expect(screen.getByText("Votre nom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nom")).toBeInTheDocument();
  });

  it("affiche un lien vers la page de connexion", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("link", { name: /se connecter/i })).toHaveAttribute("href", "/login");
  });

  // ❌ cas d'échec : bouton désactivé si le champ est vide
  it("le bouton Suivant est désactivé si le champ est vide", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /suivant/i })).toBeDisabled();
  });


  // ✅ cas normal : cliquer Suivant passe à l'étape suivante
  it("cliquer Suivant passe à l'étape prénom", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByPlaceholderText("Nom"), "Dupont");
    await user.click(screen.getByRole("button", { name: /suivant/i }));
    expect(screen.getByText("Votre prénom")).toBeInTheDocument();
  });


  // ❌ cas d'échec : mots de passe différents → erreur + bouton désactivé
  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await goToStep(user, 3);
    await user.type(screen.getByPlaceholderText("Mot de passe"), "motdepasse123");
    await user.type(screen.getByPlaceholderText("Confirmation mot de passe"), "autrechose");
    expect(screen.getByText(/les mots de passe doivent correspondre/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /créer mon compte/i })).toBeDisabled();
  });

  // ✅ cas normal : soumission réussie → appel API
  it("envoie les données à l'API lors de la soumission", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<RegisterForm />);
    await goToStep(user, 3);
    await user.type(screen.getByPlaceholderText("Mot de passe"), "motdepasse123");
    await user.type(screen.getByPlaceholderText("Confirmation mot de passe"), "motdepasse123");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", expect.any(Object));
  });
});
