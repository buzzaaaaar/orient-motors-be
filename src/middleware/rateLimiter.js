// Simple in-memory rate limiter for login attempts
const attempts = new Map();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const rateLimiter = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!attempts.has(key)) {
    attempts.set(key, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return next();
  }

  const record = attempts.get(key);

  // Check if currently locked out
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      message: `Too many login attempts. Try again in ${remainingSeconds} seconds.`,
    });
  }

  // Reset if window has passed
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    attempts.set(key, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return next();
  }

  // Increment attempt count
  record.count++;

  // Lock if max attempts exceeded
  if (record.count > MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    const lockoutSeconds = Math.ceil(LOCKOUT_DURATION / 1000);
    return res.status(429).json({
      message: `Too many login attempts. Account locked for ${lockoutSeconds} seconds.`,
    });
  }

  next();
};

// Clean up old entries periodically (every 15 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW && record.lockedUntil <= now) {
      attempts.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

module.exports = rateLimiter;
