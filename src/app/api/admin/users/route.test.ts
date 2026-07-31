import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: () => getServerSession() }));

const findMany = vi.fn();
const findUnique = vi.fn();
const create = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findMany: () => findMany(), findUnique: (a: unknown) => findUnique(a), create: (a: unknown) => create(a) } },
}));

import { GET, POST } from "./route";

const adminSession = { user: { id: "1", email: "admin@test.fr", role: "ADMIN" } };
const userSession = { user: { id: "2", email: "user@test.fr", role: "USER" } };

const postRequest = (body: unknown) =>
  new Request("http://localhost/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/users — contrôle d'accès", () => {
  // ❌ visiteur non authentifié
  it("répond 401 sans session", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  // ❌ utilisateur authentifié mais sans le rôle ADMIN
  it("répond 403 pour un utilisateur non admin", async () => {
    getServerSession.mockResolvedValue(userSession);
    const res = await GET();
    expect(res.status).toBe(403);
    expect(findMany).not.toHaveBeenCalled();
  });

  // ✅ cas normal : un admin obtient la liste
  it("répond 200 et la liste pour un admin", async () => {
    getServerSession.mockResolvedValue(adminSession);
    findMany.mockResolvedValue([{ id: "1", email: "a@b.fr" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ users: [{ id: "1", email: "a@b.fr" }] });
  });

  // 🔒 aucun mot de passe ne doit sortir de l'API
  it("ne sélectionne jamais le champ password", async () => {
    getServerSession.mockResolvedValue(adminSession);
    findMany.mockResolvedValue([]);
    await GET();
    expect(JSON.stringify(findMany.mock.calls)).not.toContain("password");
  });
});

describe("POST /api/admin/users — création", () => {
  // ❌ création interdite sans session
  it("répond 401 sans session", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await POST(postRequest({ email: "x@y.fr" }));
    expect(res.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  // ❌ création interdite pour un non-admin
  it("répond 403 pour un utilisateur non admin", async () => {
    getServerSession.mockResolvedValue(userSession);
    const res = await POST(postRequest({ email: "x@y.fr" }));
    expect(res.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  // ❌ cas limite : champs obligatoires manquants
  it("répond 400 si des champs sont manquants", async () => {
    getServerSession.mockResolvedValue(adminSession);
    const res = await POST(postRequest({ email: "x@y.fr" }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  // ❌ cas limite : email déjà enregistré
  it("répond 400 si l'email existe déjà", async () => {
    getServerSession.mockResolvedValue(adminSession);
    findUnique.mockResolvedValue({ id: "9" });
    const res = await POST(
      postRequest({ firstName: "A", lastName: "B", email: "x@y.fr", password: "secret123" })
    );
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  // 🔒 le mot de passe doit être haché, jamais stocké en clair
  it("hache le mot de passe avant enregistrement", async () => {
    getServerSession.mockResolvedValue(adminSession);
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "3", email: "x@y.fr" });

    await POST(postRequest({ firstName: "A", lastName: "B", email: "x@y.fr", password: "motdepasse" }));

    const stored = create.mock.calls[0][0].data.password;
    expect(stored).not.toBe("motdepasse");
    expect(stored).toMatch(/^\$2[aby]\$\d{2}\$/); // signature d'un hash bcrypt
  });

  // 🔒 élévation de privilège : un rôle inattendu retombe sur USER
  it("n'accorde le rôle ADMIN que s'il est explicitement demandé", async () => {
    getServerSession.mockResolvedValue(adminSession);
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "4" });

    await POST(
      postRequest({ firstName: "A", lastName: "B", email: "z@y.fr", password: "pw", role: "SUPERADMIN" })
    );
    expect(create.mock.calls[0][0].data.role).toBe("USER");
  });
});
