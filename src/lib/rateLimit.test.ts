import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIp } from "./rateLimit";

describe("checkRateLimit", () => {
  // ✅ cas normal : les tentatives sous la limite sont autorisées
  it("autorise les tentatives tant que la limite n'est pas atteinte", () => {
    const key = `test-sous-limite-${Date.now()}`;
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
  });

  // ❌ cas limite : la tentative au-delà du quota est refusée
  it("bloque la tentative qui dépasse la limite", () => {
    const key = `test-depassement-${Date.now()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    expect(checkRateLimit(key, 2, 60_000)).toBe(false);
  });

  // ✅ isolation : deux clés distinctes ont chacune leur quota
  it("compte les quotas séparément par clé", () => {
    const suffix = Date.now();
    checkRateLimit(`a-${suffix}`, 1, 60_000);
    expect(checkRateLimit(`a-${suffix}`, 1, 60_000)).toBe(false);
    expect(checkRateLimit(`b-${suffix}`, 1, 60_000)).toBe(true);
  });

  // ✅ cas limite : le quota se réinitialise une fois la fenêtre écoulée
  it("réautorise les tentatives après expiration de la fenêtre", async () => {
    const key = `test-fenetre-${Date.now()}`;
    checkRateLimit(key, 1, 20);
    expect(checkRateLimit(key, 1, 20)).toBe(false);
    await new Promise((r) => setTimeout(r, 30));
    expect(checkRateLimit(key, 1, 20)).toBe(true);
  });
});

describe("getClientIp", () => {
  // ✅ cas normal : lecture de l'en-tête standard des reverse proxies
  it("extrait la première IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" });
    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  // ✅ repli sur x-real-ip quand x-forwarded-for est absent
  it("utilise x-real-ip en repli", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.42" });
    expect(getClientIp(headers)).toBe("198.51.100.42");
  });

  // ❌ cas dégradé : aucune information d'IP disponible
  it("retourne 'unknown' sans en-tête exploitable", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
    expect(getClientIp(null)).toBe("unknown");
  });
});
