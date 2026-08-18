/**
 * Simple in-memory rate limiter for AI requests.
 * PROTOTYPE ONLY — in production, use Redis or a database-backed solution.
 * 
 * Limits each user to MAX_REQUESTS AI calls per WINDOW_MS.
 */

const MAX_REQUESTS = 10; // Max 10 AI requests per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// In-memory store: Map<userId, { count, resetTime }>
const requestCounts = new Map();

// Clean up expired entries every 10 minutes (prevents memory leak in long-running prototype)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 10 * 60 * 1000);

const checkAIRateLimit = (userId) => {
  const now = Date.now();
  const userKey = userId.toString();

  const record = requestCounts.get(userKey);

  if (!record || now > record.resetTime) {
    // First request or window expired — start fresh
    requestCounts.set(userKey, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return {
      allowed: false,
      remaining: 0,
      message: `AI rate limit reached. Please try again in ${minutesLeft} minutes.`
    };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
};

module.exports = { checkAIRateLimit };
