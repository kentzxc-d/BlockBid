import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only create the Redis client if the URL and Token are available
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Creates a generic rate limiter if Redis is configured.
 * @param requests Number of requests allowed
 * @param window Time window (e.g., "1 m", "10 s")
 * @returns Ratelimit instance or null if Redis is not configured
 */
export const createRateLimiter = (requests: number, window: `${number} ${"ms" | "s" | "m" | "h" | "d"}`) => {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
};

// --- Pre-configured limiters ---

// Global API rate limiter (e.g., 100 requests per minute)
export const globalRateLimiter = createRateLimiter(100, "1 m");

// Strict AI Evaluator rate limiter (e.g., 5 requests per minute)
export const aiEvaluateRateLimiter = createRateLimiter(5, "1 m");

// Action limiters (bids, proposals, etc.) (e.g., 20 requests per minute)
export const actionRateLimiter = createRateLimiter(20, "1 m");
