import { render, screen } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { ArticlesPage } from "./ArticlesPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/articles",
}));

vi.mock("@/shared/ui/layout/PublicHeader", () => ({
  PublicHeader: () => null,
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockResolvedValue({ json: async () => ({ resources: [] }) });
});

describe("ArticlesPage", () => {
  // ✅ cas normal : les éléments statiques s'affichent immédiatement
  it("affiche le label Articles", () => {
    render(<ArticlesPage />);
    expect(screen.getByText("Articles")).toBeInTheDocument();
  });

  it("affiche le titre principal", () => {
    render(<ArticlesPage />);
    expect(screen.getByText("Ressources et contenus")).toBeInTheDocument();
  });

  // ✅ cas normal : aucun article → message vide
  it("affiche un message quand il n'y a aucun article", async () => {
    render(<ArticlesPage />);
    expect(await screen.findByText("Aucun article pour l'instant.")).toBeInTheDocument();
  });

  // ✅ cas normal : articles reçus → affichés dans la liste
  it("affiche les articles retournés par l'API", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        resources: [
          { id: "1", title: "Mon premier article", content: "Contenu test", imageUrl: null, readingTime: 3, createdAt: "2025-01-01" },
        ],
      }),
    });
    render(<ArticlesPage />);
    expect(await screen.findByText("Mon premier article")).toBeInTheDocument();
  });
});
