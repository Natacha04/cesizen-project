import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect, vi } from "vitest";
import dayjs from "dayjs";
import { EmotionCalendar } from "./EmotionCalendar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// FluentEmoji fait des appels réseau pour charger les emojis → on le simule
vi.mock("@lobehub/fluent-emoji", () => ({
  FluentEmoji: ({ emoji }: { emoji: string }) => <span>{emoji}</span>,
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  // Par défaut : aucune émotion enregistrée
  mockFetch.mockResolvedValue({ json: async () => ({ emotions: [] }) });
});

describe("EmotionCalendar", () => {
  // ✅ cas normal : les éléments statiques s'affichent immédiatement
  it("affiche le titre du calendrier", () => {
    render(<EmotionCalendar />);
    expect(screen.getByText("Ton calendrier du mois")).toBeInTheDocument();
  });

  it("affiche le label Suivi emotionnel", () => {
    render(<EmotionCalendar />);
    expect(screen.getByText(/suivi emotionnel/i)).toBeInTheDocument();
  });

  it("affiche le bouton Mon emotion du jour", () => {
    render(<EmotionCalendar />);
    expect(screen.getByRole("button", { name: /mon emotion du jour/i })).toBeInTheDocument();
  });

  it("affiche les 3 filtres de période", () => {
    render(<EmotionCalendar />);
    expect(screen.getByRole("button", { name: "Semaine" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mois" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Annee" })).toBeInTheDocument();
  });

  // ❌ cas d'échec : sans données, aucune émotion dominante ne s'affiche
  it("affiche un message si aucune émotion n'est disponible", async () => {
    render(<EmotionCalendar />);
    expect(await screen.findByText(/aucune emotion disponible/i)).toBeInTheDocument();
  });

  // ✅ cas normal : avec des données, l'émotion dominante s'affiche
  it("affiche l'émotion dominante après le chargement", async () => {
    const today = dayjs().format("YYYY-MM-DD");
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ emotions: [{ date: today, kind: "joy" }] }),
    });
    render(<EmotionCalendar />);
    expect(await screen.findByText(/emotion dominante/i)).toBeInTheDocument();
  });

  // ✅ cas normal : cliquer sur "Semaine" change le filtre actif
  it("le filtre Semaine s'active quand on clique dessus", async () => {
    const user = userEvent.setup();
    render(<EmotionCalendar />);
    const semaineButton = screen.getByRole("button", { name: "Semaine" });
    await user.click(semaineButton);
    expect(semaineButton).toHaveAttribute("aria-pressed", "true");
  });
});
