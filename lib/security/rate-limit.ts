/**
 * Simple memory-based rate limiter for API routes.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * Checks if a request should be rate limited.
 * 
 * @param identifier - Unique identifier for the client (e.g., IP or UserID)
 * @param options    - Limit and window duration
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(identifier: string, { limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, remaining: limit - 1, reset: store[identifier].resetTime };
  }

  record.count++;
  
  if (record.count > limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}

/**
 * Clean up expired records every 5 minutes to prevent memory leaks.
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);
