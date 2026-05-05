import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EmotionTrackerPage } from "./EmotionTrackerPage";

// On simule les modules Next.js qui ne fonctionnent pas en dehors de Next.js
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/emotions/tracker",
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("@/shared/ui/layout/PublicHeader", () => ({
  PublicHeader: () => null,
}));

describe("EmotionTrackerPage", () => {
  // ✅ cas normal : l'étape 1 s'affiche correctement
  it("affiche la question initiale", () => {
    render(<EmotionTrackerPage />);
    expect(screen.getByText(/comment tu te sens aujourd'hui/i)).toBeInTheDocument();
  });

  it("affiche au moins 6 boutons d'émotion", () => {
    render(<EmotionTrackerPage />);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(6);
  });

  // ✅ cas normal : cliquer Validation passe à l'étape 2
  it("passe à l'étape sous-émotion après avoir cliqué Validation", async () => {
    const user = userEvent.setup();
    render(<EmotionTrackerPage />);
    await user.click(screen.getByRole("button", { name: /validation/i }));
    expect(screen.getByText(/etonnement/i)).toBeInTheDocument();
  });

  // ❌ cas d'échec : sans sous-émotion, on ne peut pas valider
  it("le bouton Validation est désactivé sans sous-émotion sélectionnée", async () => {
    const user = userEvent.setup();
    render(<EmotionTrackerPage />);
    await user.click(screen.getByRole("button", { name: /validation/i }));
    expect(screen.getByRole("button", { name: /validation/i })).toBeDisabled();
  });

  // ✅ cas normal : sélectionner une sous-émotion active le bouton
  it("le bouton Validation s'active après sélection d'une sous-émotion", async () => {
    const user = userEvent.setup();
    render(<EmotionTrackerPage />);
    await user.click(screen.getByRole("button", { name: /validation/i }));
    await user.click(screen.getByText(/etonnement/i));
    expect(screen.getByRole("button", { name: /validation/i })).toBeEnabled();
  });

  // ✅ cas normal : une date valide s'affiche
  it("affiche une date valide passée en prop", () => {
    render(<EmotionTrackerPage date="2025-12-25" />);
    expect(screen.getByText("25/12/2025")).toBeInTheDocument();
  });

  // ❌ cas d'échec : une date invalide → affiche la date du jour
  it("affiche la date du jour si la date passée est invalide", () => {
    render(<EmotionTrackerPage date="pas-une-date" />);
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    expect(screen.getByText(today)).toBeInTheDocument();
  });

  // ❌ cas d'échec : les sous-émotions ne s'affichent pas avant l'étape 2
  it("les sous-émotions ne sont pas visibles à l'étape 1", () => {
    render(<EmotionTrackerPage />);
    expect(screen.queryByText(/etonnement/i)).not.toBeInTheDocument();
  });
});
