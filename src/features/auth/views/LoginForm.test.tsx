import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("LoginForm", () => {
  it("affiche les champs email et mot de passe", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it("le bouton est désactivé si les champs sont vides", () => {
    render(<LoginForm />);
    const button = screen.getByRole("button", { name: /se connecter/i });
    expect(button).toBeDisabled();
  });

  it("le bouton est activé quand email et mot de passe sont remplis", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse123");
    const button = screen.getByRole("button", { name: /se connecter/i });
    expect(button).toBeEnabled();
  });

  it("affiche un lien vers la page d'inscription", () => {
    render(<LoginForm />);
    const link = screen.getByRole("link", { name: /créer un compte/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
