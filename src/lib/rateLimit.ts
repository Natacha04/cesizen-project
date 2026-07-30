type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Rate limiter en mémoire (fenêtre fixe). Suffisant pour une seule instance ;
 * ne partage pas l'état entre plusieurs instances serverless/edge. Pour une
 * vraie mise à l'échelle, remplacer par un store partagé (ex: Upstash Redis).
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function getClientIp(headers: Headers | Record<string, string | undefined> | null | undefined): string {
  const get = (name: string): string | null => {
    if (!headers) return null;
    if (headers instanceof Headers) return headers.get(name);
    return headers[name] ?? null;
  };

  const forwardedFor = get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return get("x-real-ip") ?? "unknown";
}
