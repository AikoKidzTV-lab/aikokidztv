/**
 * Mock Rate Limiter
 * Simulates a rate limit check. In a real application, this would interface
 * with a backend service (Redis, database, etc.) or use local storage for simple client-side throttling.
 */

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

const requestLog = new Map();

/**
 * Checks if the user has exceeded the rate limit.
 * @param {string} userId - Unique identifier for the user (or IP).
 * @returns {boolean} - True if allowed, False if rate limited.
 */
export const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRequests = requestLog.get(userId) || [];

  // Filter out requests older than the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS) {
    return false; // Rate limited
  }

  // Log the new request
  recentRequests.push(now);
  requestLog.set(userId, recentRequests);
  
  return true; // Allowed
};
