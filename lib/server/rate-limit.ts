import "server-only";

/**
 * Простий in-memory ліміт на ключ (зазвичай IP). На serverless працює в межах
 * одного інстансу — від ботів з одного IP і випадкових дабл-кліків вистачає.
 */
export function createRateLimiter(maxHits: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return function allow(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= maxHits) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);

    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (times.every((t) => now - t >= windowMs)) hits.delete(k);
      }
    }
    return true;
  };
}

/** Заявки: 20 запитів / 10 хв — з запасом, студенти можуть сидіти за одним NAT універу. */
export const allowRequest = createRateLimiter(20, 10 * 60 * 1000);

export function ipFromHeaders(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

export function clientIp(req: Request): string {
  return ipFromHeaders(req.headers);
}
