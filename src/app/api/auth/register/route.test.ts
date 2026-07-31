import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (a: unknown) => findUnique(a), create: (a: unknown) => create(a) } },
}));

import { POST } from "./route";

// Chaque test utilise une IP distincte : le rate limiting est global au module.
let ipCounter = 0;
const registerRequest = (body: unknown, ip?: string) =>
  new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip ?? `10.0.0.${++ipCounter}` },
    body: JSON.stringify(body),
  });

const validBody = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  password: "monMotDePasse",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  // ✅ cas normal : inscription réussie
  it("crée le compte et répond 201", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "1" });

    const res = await POST(registerRequest(validBody));

    expect(res.status).toBe(201);
    expect(create).toHaveBeenCalled();
  });

  // ❌ cas limite : email déjà utilisé
  it("refuse un email déjà enregistré", async () => {
    findUnique.mockResolvedValue({ id: "existant" });

    const res = await POST(registerRequest(validBody));

    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  // 🔒 le mot de passe ne doit jamais être stocké en clair
  it("hache le mot de passe avec bcrypt", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "1" });

    await POST(registerRequest(validBody));

    const stored = create.mock.calls[0][0].data.password;
    expect(stored).not.toBe(validBody.password);
    expect(stored).toMatch(/^\$2[aby]\$\d{2}\$/); // signature d'un hash bcrypt
  });

  // 🔒 protection anti brute-force : au-delà du quota, la requête est rejetée
  it("répond 429 après trop de tentatives depuis la même IP", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "1" });

    const ip = "192.0.2.99";
    const statuts: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await POST(registerRequest(validBody, ip));
      statuts.push(res.status);
    }

    expect(statuts.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuts.slice(5)).toEqual([429, 429]);
  });
});
