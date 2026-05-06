import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("LoginForm", () => {
  // ✅ cas normal : le formulaire affiche les bons champs
  it("affiche les champs email et mot de passe", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("Votre adresse mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre mot de passe")).toBeInTheDocument();
  });

  it("affiche un lien vers la page d'inscription", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: /créer votre compte/i })).toHaveAttribute("href", "/register");
  });

  // ❌ cas d'échec : le bouton ne doit pas fonctionner si les champs sont vides
  it("le bouton est désactivé si les champs sont vides", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /suivant/i })).toBeDisabled();
  });

  // ✅ cas normal : le bouton devient actif quand tout est rempli
  it("le bouton s'active quand email et mot de passe sont remplis", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByPlaceholderText("Votre adresse mail"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "motdepasse123");
    expect(screen.getByRole("button", { name: /suivant/i })).toBeEnabled();
  });
});
