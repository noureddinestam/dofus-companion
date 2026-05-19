// In-memory IP rate-limiter for low-volume endpoints. Per-instance only on
// Vercel — a determined attacker bypasses it via multiple instances. Pair
// with a honeypot, Zod validation, and Vercel WAF for real defense.

interface Bucket {
  count: number;
  windowStart: number;
}

const BUCKETS = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = BUCKETS.get(key);

  if (!bucket || now - bucket.windowStart > options.windowMs) {
    if (BUCKETS.size >= MAX_BUCKETS) {
      // Evict the oldest entry to keep memory bounded.
      const firstKey = BUCKETS.keys().next().value;
      if (firstKey !== undefined) BUCKETS.delete(firstKey);
    }
    BUCKETS.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      retryAfterSeconds: 0,
    };
  }

  bucket.count += 1;
  if (bucket.count > options.maxRequests) {
    const elapsedMs = now - bucket.windowStart;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((options.windowMs - elapsedMs) / 1000),
    };
  }
  return {
    allowed: true,
    remaining: options.maxRequests - bucket.count,
    retryAfterSeconds: 0,
  };
}
